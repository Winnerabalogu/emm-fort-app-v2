import React from 'react';
import { Plus, Calendar, Clock, Sparkles, Camera } from 'lucide-react';
import { ContentCalendarProps } from '@/types/Creatortypes/contentHub';

const ContentCalendar: React.FC<ContentCalendarProps> = ({ onSchedulePost }) => {
  const upcomingFeatures = [
    {
      icon: Clock,
      title: 'Auto-scheduling',
      description: 'Automatically schedule posts for optimal engagement times'
    },
    {
      icon: Sparkles,
      title: 'Optimal posting times',
      description: 'AI-powered recommendations for when your audience is most active'
    },
    {
      icon: Camera,
      title: 'Content reminders',
      description: 'Never miss a posting opportunity with smart notifications'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Content Calendar</h3>
        <button 
          onClick={onSchedulePost}
          className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all duration-200 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Schedule Post
        </button>
      </div>

      {/* Coming Soon Section */}
      <div className="bg-gray-50 rounded-xl p-8 text-center">
        <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h4 className="text-lg font-semibold text-gray-900 mb-2">Content Calendar Coming Soon</h4>
        <p className="text-gray-600 mb-6">
          Plan and schedule your content for maximum engagement and earnings
        </p>
        
        {/* Feature Preview */}
        <div className="flex flex-wrap gap-4 justify-center text-sm text-gray-500 mb-8">
          {upcomingFeatures.map((feature, index) => (
            <div key={index} className="flex items-center gap-2">
              <feature.icon className="h-4 w-4" />
              {feature.title}
            </div>
          ))}
        </div>

        {/* Notify Me Button */}
        <button 
          onClick={() => console.log('Notify when ready')}
          className="bg-white text-gray-700 border border-gray-200 px-6 py-2 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Notify Me When Ready
        </button>
      </div>

      {/* Feature Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {upcomingFeatures.map((feature, index) => (
          <div key={index} className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-orange-100 rounded-lg">
                <feature.icon className="h-4 w-4 text-orange-600" />
              </div>
              <h5 className="font-medium text-gray-900">{feature.title}</h5>
            </div>
            <p className="text-sm text-gray-600">{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContentCalendar;