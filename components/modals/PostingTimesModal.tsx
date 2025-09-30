import React from 'react';
import { Clock, X, Eye, Activity, Zap, Target, Calendar, TrendingUp } from "lucide-react";

interface PostingTimesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PostingTimesModal: React.FC<PostingTimesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const postingData = {
    instagram: {
      bestTimes: [
        { time: '9:00 AM', engagement: 92, day: 'Monday' },
        { time: '11:00 AM', engagement: 88, day: 'Tuesday' },
        { time: '2:00 PM', engagement: 85, day: 'Wednesday' },
        { time: '5:00 PM', engagement: 90, day: 'Thursday' },
        { time: '7:00 PM', engagement: 95, day: 'Friday' }
      ],
      bestDays: ['Friday', 'Saturday', 'Sunday'],
      worstTimes: ['3:00 AM - 6:00 AM', '12:00 PM - 1:00 PM']
    },
    tiktok: {
      bestTimes: [
        { time: '6:00 AM', engagement: 87, day: 'Monday' },
        { time: '10:00 AM', engagement: 83, day: 'Tuesday' },
        { time: '4:00 PM', engagement: 91, day: 'Wednesday' },
        { time: '7:00 PM', engagement: 94, day: 'Thursday' },
        { time: '9:00 PM', engagement: 96, day: 'Friday' }
      ],
      bestDays: ['Tuesday', 'Thursday', 'Friday'],
      worstTimes: ['2:00 AM - 5:00 AM', '1:00 PM - 3:00 PM']
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <Clock className="h-6 w-6 text-orange-500" />
            <h2 className="text-xl font-semibold text-gray-900">Best Posting Times</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Instagram Section */}
          <div className="bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-200 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-pink-100 rounded-lg">
                <Eye className="h-5 w-5 text-pink-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Instagram</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Best Times This Week</h4>
                <div className="space-y-2">
                  {postingData.instagram.bestTimes.map((slot, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg">
                      <div>
                        <span className="font-medium text-gray-900">{slot.day}</span>
                        <span className="text-gray-600 ml-2">{slot.time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-pink-500 h-2 rounded-full"
                            style={{ width: `${slot.engagement}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900">{slot.engagement}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3">Weekly Insights</h4>
                <div className="space-y-3">
                  <div className="p-3 bg-white rounded-lg">
                    <h5 className="text-sm font-medium text-gray-900 mb-1">Best Days</h5>
                    <p className="text-sm text-gray-600">{postingData.instagram.bestDays.join(', ')}</p>
                  </div>
                  <div className="p-3 bg-white rounded-lg">
                    <h5 className="text-sm font-medium text-gray-900 mb-1">Avoid These Times</h5>
                    <p className="text-sm text-gray-600">{postingData.instagram.worstTimes.join(', ')}</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-lg">
                    <h5 className="text-sm font-medium text-green-900 mb-1">Pro Tip</h5>
                    <p className="text-sm text-green-800">Post Reels between 7-9 PM for maximum visibility</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* TikTok Section */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Activity className="h-5 w-5 text-gray-900" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">TikTok</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Best Times This Week</h4>
                <div className="space-y-2">
                  {postingData.tiktok.bestTimes.map((slot, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg">
                      <div>
                        <span className="font-medium text-gray-900">{slot.day}</span>
                        <span className="text-gray-600 ml-2">{slot.time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-gray-900 h-2 rounded-full"
                            style={{ width: `${slot.engagement}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900">{slot.engagement}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3">Weekly Insights</h4>
                <div className="space-y-3">
                  <div className="p-3 bg-white rounded-lg">
                    <h5 className="text-sm font-medium text-gray-900 mb-1">Best Days</h5>
                    <p className="text-sm text-gray-600">{postingData.tiktok.bestDays.join(', ')}</p>
                  </div>
                  <div className="p-3 bg-white rounded-lg">
                    <h5 className="text-sm font-medium text-gray-900 mb-1">Avoid These Times</h5>
                    <p className="text-sm text-gray-600">{postingData.tiktok.worstTimes.join(', ')}</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <h5 className="text-sm font-medium text-blue-900 mb-1">Pro Tip</h5>
                    <p className="text-sm text-blue-800">Evening posts (7-9 PM) get 2x more engagement</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* General Recommendations */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-4">General Recommendations</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Zap className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-gray-900">Consistency Matters</h4>
                    <p className="text-sm text-gray-600">Post at the same times regularly to build audience expectations</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Target className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-gray-900">Test Different Times</h4>
                    <p className="text-sm text-gray-600">Your audience might be different - experiment with timing</p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-gray-900">Weekend Strategy</h4>
                    <p className="text-sm text-gray-600">Weekends work great for lifestyle and behind-the-scenes content</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <TrendingUp className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-gray-900">Monitor Trends</h4>
                    <p className="text-sm text-gray-600">Optimal times can shift based on current events and trends</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostingTimesModal;