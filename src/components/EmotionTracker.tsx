import { useState, useRef, useEffect } from 'react';
import * as faceapi from 'face-api.js';
import { Button } from '@/components/ui/button';
import { Camera, CameraOff } from 'lucide-react';
import { useEmotion } from '@/context/EmotionContext';
import { useAuth } from '@/context/AuthContext';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { useToast } from '@/hooks/use-toast';

export const EmotionTracker = () => {
  const [isTracking, setIsTracking] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [detectedEmotion, setDetectedEmotion] = useState<string>('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const { updateEmotion } = useEmotion();
  const { currentUser } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    loadModels();
    return () => {
      stopTracking();
    };
  }, []);

  const loadModels = async () => {
    try {
      const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.12/model';
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
      ]);
      setModelsLoaded(true);
    } catch (error) {
      console.error('Error loading face-api models:', error);
      toast({
        title: 'Error',
        description: 'Failed to load emotion detection models',
        variant: 'destructive',
      });
    }
  };

  const startTracking = async () => {
    if (!modelsLoaded) {
      toast({
        title: 'Loading models',
        description: 'Please wait while models are loading...',
      });
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        // Wait for video to be ready before starting detection
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().then(() => {
            console.log('Video started, beginning emotion detection...');
            setIsTracking(true);
            startDetectionLoop();
          }).catch((err) => {
            console.error('Error playing video:', err);
          });
        };
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast({
        title: 'Camera Error',
        description: 'Unable to access camera. Please check permissions.',
        variant: 'destructive',
      });
    }
  };

  const stopTracking = () => {
    // Clear detection interval
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }
    
    // Stop video stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    
    // Clear video source
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setIsTracking(false);
    setDetectedEmotion('');
  };

  const startDetectionLoop = () => {
    // Clear any existing interval
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
    }

    // Start new detection loop
    detectionIntervalRef.current = setInterval(async () => {
      if (!videoRef.current || videoRef.current.readyState !== 4) {
        console.log('Video not ready yet...');
        return;
      }

      try {
        const detections = await faceapi
          .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
          .withFaceExpressions();

        if (detections) {
          const expressions = detections.expressions;
          const emotion = Object.keys(expressions).reduce((a, b) =>
            expressions[a as keyof typeof expressions] > expressions[b as keyof typeof expressions] ? a : b
          );

          console.log('Detected emotion:', emotion);
          setDetectedEmotion(emotion);
          updateEmotion(emotion);

          // Save to Firebase (throttled to avoid too many writes)
          if (currentUser && Math.random() < 0.1) { // Save ~10% of detections
            await addDoc(collection(db, 'emotions'), {
              userId: currentUser.uid,
              emotion,
              timestamp: new Date().toISOString(),
            });
          }
        } else {
          console.log('No face detected');
        }
      } catch (error) {
        console.error('Detection error:', error);
      }
    }, 1000); // Check every second
  };

  return (
    <div className="glass-card p-6 rounded-2xl space-y-4">
      <div className="relative rounded-xl overflow-hidden bg-muted aspect-video">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover mirror"
          style={{ transform: 'scaleX(-1)' }}
        />

        {detectedEmotion && isTracking && (
          <div className="absolute top-4 left-4 glass-card px-4 py-2 rounded-full">
            <p className="text-sm font-semibold gradient-text capitalize">{detectedEmotion}</p>
          </div>
        )}
      </div>

      <Button
        onClick={isTracking ? stopTracking : startTracking}
        className="w-full"
        variant={isTracking ? 'destructive' : 'default'}
        disabled={!modelsLoaded}
      >
        {isTracking ? (
          <>
            <CameraOff className="w-4 h-4 mr-2" />
            Stop Tracking
          </>
        ) : (
          <>
            <Camera className="w-4 h-4 mr-2" />
            Start Emotion Tracking
          </>
        )}
      </Button>

      {!modelsLoaded && (
        <p className="text-xs text-muted-foreground text-center">Loading emotion detection models...</p>
      )}
    </div>
  );
};
