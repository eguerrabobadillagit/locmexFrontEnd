import { Injectable, signal } from '@angular/core';

export interface AnimatedPosition {
  latitude: number;
  longitude: number;
  heading: number;
}

export interface VehicleAnimation {
  vehicleId: string;
  startPosition: AnimatedPosition;
  endPosition: AnimatedPosition;
  startTime: number;
  duration: number;
}

@Injectable({
  providedIn: 'root'
})
export class VehicleAnimationService {
  private animations = new Map<string, VehicleAnimation>();
  private animationFrameId: number | null = null;
  
  animatedPositions = signal<Map<string, AnimatedPosition>>(new Map());

  startAnimation(
    vehicleId: string,
    currentPosition: AnimatedPosition,
    targetPosition: AnimatedPosition,
    durationMs: number = 2000
  ): void {
    const animation: VehicleAnimation = {
      vehicleId,
      startPosition: { ...currentPosition },
      endPosition: { ...targetPosition },
      startTime: performance.now(),
      duration: durationMs
    };

    this.animations.set(vehicleId, animation);

    if (!this.animationFrameId) {
      this.animate();
    }
  }

  private animate = (): void => {
    const now = performance.now();
    const updatedPositions = new Map<string, AnimatedPosition>();
    const completedAnimations: string[] = [];

    this.animations.forEach((animation, vehicleId) => {
      const elapsed = now - animation.startTime;
      const progress = Math.min(elapsed / animation.duration, 1);

      const easedProgress = this.easeInOutCubic(progress);

      const interpolatedPosition: AnimatedPosition = {
        latitude: this.lerp(
          animation.startPosition.latitude,
          animation.endPosition.latitude,
          easedProgress
        ),
        longitude: this.lerp(
          animation.startPosition.longitude,
          animation.endPosition.longitude,
          easedProgress
        ),
        heading: this.lerpAngle(
          animation.startPosition.heading,
          animation.endPosition.heading,
          easedProgress
        )
      };

      updatedPositions.set(vehicleId, interpolatedPosition);

      if (progress >= 1) {
        completedAnimations.push(vehicleId);
      }
    });

    this.animatedPositions.set(updatedPositions);

    completedAnimations.forEach(id => this.animations.delete(id));

    if (this.animations.size > 0) {
      this.animationFrameId = requestAnimationFrame(this.animate);
    } else {
      this.animationFrameId = null;
    }
  };

  private lerp(start: number, end: number, t: number): number {
    return start + (end - start) * t;
  }

  private lerpAngle(start: number, end: number, t: number): number {
    let diff = end - start;
    
    if (diff > 180) {
      diff -= 360;
    } else if (diff < -180) {
      diff += 360;
    }
    
    let result = start + diff * t;
    
    if (result < 0) {
      result += 360;
    } else if (result >= 360) {
      result -= 360;
    }
    
    return result;
  }

  private easeInOutCubic(t: number): number {
    return t < 0.5
      ? 4 * t * t * t
      : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  stopAnimation(vehicleId: string): void {
    this.animations.delete(vehicleId);
    
    if (this.animations.size === 0 && this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  stopAllAnimations(): void {
    this.animations.clear();
    
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  getAnimatedPosition(vehicleId: string): AnimatedPosition | undefined {
    return this.animatedPositions().get(vehicleId);
  }
}
