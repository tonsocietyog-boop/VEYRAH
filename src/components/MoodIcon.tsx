import React from 'react';
import { Feather, Flame, Ghost, Heart, LucideProps, Moon, Orbit, Smile, Zap } from 'lucide-react';
import { Mood } from '../types';

interface MoodIconProps extends LucideProps {
  mood: Mood;
}

export const MoodIcon: React.FC<MoodIconProps> = ({ mood, className, ...props }) => {
  switch (mood) {
    case 'Exciting':
      return <Zap className={className} {...props} />;
    case 'Relaxing':
      return <Feather className={className} {...props} />;
    case 'Dark':
      return <Moon className={className} {...props} />;
    case 'Romantic':
      return <Heart className={className} {...props} />;
    case 'Funny':
      return <Smile className={className} {...props} />;
    case 'Scary':
      return <Ghost className={className} {...props} />;
    case 'Deep':
      return <Orbit className={className} {...props} />;
    case 'Inspiring':
      return <Flame className={className} {...props} />;
    default:
      return <Zap className={className} {...props} />;
  }
};
