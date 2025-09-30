import React, { useRef, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

type ContentTabType = 'templates' | 'my-content' | 'captions' | 'schedule';

interface MobileSliderNavigationProps {
  tabs: Array<{ 
    id: ContentTabType; 
    label: string; 
    icon: React.ComponentType<{className: string}> 
  }>;
  activeTab: ContentTabType;
  onTabChange: (tab: ContentTabType) => void;
}

const MobileSliderNavigation: React.FC<MobileSliderNavigationProps> = ({ 
  tabs, 
  activeTab, 
  onTabChange 
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScrollButtons = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  useEffect(() => {
    checkScrollButtons();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScrollButtons);
      const resizeObserver = new ResizeObserver(checkScrollButtons);
      resizeObserver.observe(container);
      
      return () => {
        container.removeEventListener('scroll', checkScrollButtons);
        resizeObserver.disconnect();
      };
    }
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 150;
      const newScrollLeft = scrollContainerRef.current.scrollLeft + 
        (direction === 'right' ? scrollAmount : -scrollAmount);
      
      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="border-b border-gray-200 bg-white">
      {/* Desktop Navigation */}
      <div className="hidden md:flex gap-1 px-6 py-4">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
             className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
    activeTab === tab.id
      ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-sm'
      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
  }`}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Mobile Navigation with Slider */}
      <div className="md:hidden relative">
        {/* Left Scroll Button */}
        <button
          onClick={() => scroll('left')}
          className={`absolute left-0 top-0 bottom-0 z-10 w-8 bg-gradient-to-r from-white to-transparent flex items-center justify-start pl-1 transition-opacity ${
            canScrollLeft ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          aria-label="Scroll left"
        >
          <div className="bg-white rounded-full shadow-md p-1">
            <ChevronLeft className="h-3 w-3 text-gray-600" />
          </div>
        </button>

        {/* Scrollable Tab Container */}
        <div 
          ref={scrollContainerRef}
          className="flex gap-2 px-4 py-3 overflow-x-auto scrollbar-hide"
          style={{ 
            scrollbarWidth: 'none', 
            msOverflowStyle: 'none'
          }}
        >
          <style jsx>{`
            .scrollbar-hide::-webkit-scrollbar {
              display: none;
            }
          `}</style>
          
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 flex-shrink-0 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-sm'
                    : 'text-gray-600 bg-gray-100 hover:text-gray-900 hover:bg-gray-200'
                }`}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                <span className="hidden xs:inline">{tab.label}</span>
                <span className="xs:hidden text-xs">
                  {tab.label.split(' ')[0]}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right Scroll Button */}
        <button
          onClick={() => scroll('right')}
          className={`absolute right-0 top-0 bottom-0 z-10 w-8 bg-gradient-to-l from-white to-transparent flex items-center justify-end pr-1 transition-opacity ${
            canScrollRight ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          aria-label="Scroll right"
        >
          <div className="bg-white rounded-full shadow-md p-1">
            <ChevronRight className="h-3 w-3 text-gray-600" />
          </div>
        </button>
      </div>
    </div>
  );
};

export default MobileSliderNavigation;