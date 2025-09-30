import { TrendingUp, X, Zap, Target } from "lucide-react";

interface ContentInsightsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ContentInsightsModal: React.FC<ContentInsightsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const insights = {
    trending: [
      { topic: 'Meal Prep Sunday', growth: '+45%', category: 'Food & Lifestyle' },
      { topic: 'Budget Grocery Shopping', growth: '+38%', category: 'Finance & Food' },
      { topic: 'Quick Recipes', growth: '+32%', category: 'Cooking' },
      { topic: 'Sustainable Living', growth: '+28%', category: 'Lifestyle' }
    ],
    contentSuggestions: [
      {
        title: 'Weekly Meal Prep Challenge',
        description: 'Show your followers how to prep meals for an entire week in 2 hours',
        estimated_reach: '15K-25K',
        difficulty: 'Medium',
        trending_score: 92
      },
      {
        title: 'Budget-Friendly Grocery Haul',
        description: 'Create content around shopping for a family of 4 under $100',
        estimated_reach: '20K-35K',
        difficulty: 'Easy',
        trending_score: 87
      },
      {
        title: '30-Minute Recipe Series',
        description: 'Quick dinner recipes that busy families can make in 30 minutes',
        estimated_reach: '12K-20K',
        difficulty: 'Easy',
        trending_score: 84
      }
    ],
    hashtags: {
      trending: ['#mealprepsunday', '#budgetfriendly', '#quickrecipes', '#groceryhaul', '#sustainableliving'],
      underused: ['#mealplanning', '#budgettips', '#kitchenhacks', '#familyfood', '#healthyeating'],
      seasonal: ['#fallrecipes', '#backtoschool', '#holidayprep']
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-6 w-6 text-orange-500" />
            <h2 className="text-xl font-semibold text-gray-900">Content Insights</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Trending Topics */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Trending Topics in Your Niche
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {insights.trending.map((topic, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-white rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">{topic.topic}</h4>
                    <p className="text-sm text-gray-600">{topic.category}</p>
                  </div>
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                    {topic.growth}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Content Suggestions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Zap className="h-5 w-5 text-blue-600" />
              AI-Powered Content Suggestions
            </h3>
            <div className="space-y-4">
              {insights.contentSuggestions.map((suggestion, index) => (
                <div key={index} className="p-4 bg-white rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{suggestion.title}</h4>
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                      Score: {suggestion.trending_score}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{suggestion.description}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>Est. Reach: {suggestion.estimated_reach}</span>
                    <span>Difficulty: {suggestion.difficulty}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Hashtag Strategy */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Target className="h-5 w-5 text-purple-600" />
              Hashtag Strategy
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3 text-green-700">🔥 Trending Now</h4>
                <div className="space-y-2">
                  {insights.hashtags.trending.map((hashtag, index) => (
                    <span key={index} className="inline-block px-2 py-1 bg-green-100 text-green-700 rounded-full text-sm mr-2 mb-2">
                      {hashtag}
                    </span>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-3 text-blue-700">💎 Hidden Gems</h4>
                <div className="space-y-2">
                  {insights.hashtags.underused.map((hashtag, index) => (
                    <span key={index} className="inline-block px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-sm mr-2 mb-2">
                      {hashtag}
                    </span>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-3 text-orange-700">🍂 Seasonal</h4>
                <div className="space-y-2">
                  {insights.hashtags.seasonal.map((hashtag, index) => (
                    <span key={index} className="inline-block px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-sm mr-2 mb-2">
                      {hashtag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Action Items */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Recommended Actions</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-white rounded-lg">
                <div className="flex-shrink-0 w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center mt-0.5">
                  <span className="text-orange-600 text-sm font-bold">1</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Focus on meal prep content this week</h4>
                  <p className="text-sm text-gray-600">Trending topic with high engagement potential</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-white rounded-lg">
                <div className="flex-shrink-0 w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center mt-0.5">
                  <span className="text-orange-600 text-sm font-bold">2</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Incorporate budget-focused angles</h4>
                  <p className="text-sm text-gray-600">High-growth category matching your audience</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-white rounded-lg">
                <div className="flex-shrink-0 w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center mt-0.5">
                  <span className="text-orange-600 text-sm font-bold">3</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Test underused hashtags</h4>
                  <p className="text-sm text-gray-600">Lower competition could mean higher visibility</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentInsightsModal;