import { useState } from 'react';
import { Sun, Music, Utensils } from 'lucide-react';

// Helper function to convert time string to hours (numeric)
const timeToHours = (timeString: string) => {
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours + minutes / 60;
};

interface ConflictInfo {
    position: string
}

interface Event {
    name: string
    time: string
    hours: number
    description: string

}

// Helper function to determine position and size
const getEventStyle = (event: Event, conflictInfo: ConflictInfo | null = null) => {
  const startHour = timeToHours(event.time);
  
  // Find minimum time across all days for consistent grid
  const baseTime = 9;
  
  // Calculate top position (start time)
  const top = (startHour - baseTime) * 60; // 60px per hour
  
  // Calculate height (duration)
  const height = event.hours * 60;
  
  // Default to full width
  let width = '100%';
  let left = '0%';
  
  // If there's a conflict, adjust width and position
  if (conflictInfo) {
    width = '48%'; // Each overlapping event takes up roughly half the space
    left = conflictInfo.position === 'left' ? '0%' : '50%';
  }
  
  return {
    top: `${top}px`,
    height: `${height}px`,
    width,
    left,
  };
};

// Color mapping function
const getColorClass = (colorString: string): string => {
  const colorMap: Record<string, string> = {
    'blue-100': 'bg-blue-100 border-blue-200',
    'green-100': 'bg-green-100 border-green-200',
    'yellow-100': 'bg-yellow-100 border-yellow-200',
    'red-100': 'bg-red-100 border-red-200',
    'purple-100': 'bg-purple-100 border-purple-200',
  };
  
  return colorMap[colorString] || 'bg-gray-100 border-gray-200';
};

export default function EventSchedule() {
  const [activeDay, setActiveDay] = useState('Freitag');
  
  const programItems = [
    {
      day: "Freitag",
      events: [
        { name: "Arrival", time: "15:00", hours: 3.5, color: "blue-100", description: "everybody arriving", icon: Sun },
        { name: "Dinner", time: "18:30", hours: 1.5, color: "green-100", description: "legga legga", icon: Utensils },
        { name: "Diashow", time: "20:00", hours: 1.5, color: "green-100", description: "Nostalgie mit Tascha T", icon: Music },
        { name: "Wintergarten", time: "21:30", hours: 1.5, color: "green-100", description: "Good Music", icon: Music },
      ]
    },
    {
      day: "Samstag",
      events: [
        { name: "Breakfast", time: "11:00", hours: 2, color: "blue-100", description: "placeholder", icon: Utensils },
        { name: "Breakfast2", time: "11:00", hours: 2, color: "blue-100", description: "placeholder", icon: Utensils },
        { name: "Games", time: "13:00", hours: 3, color: "blue-100", description: "placeholder", icon: Utensils },
        { name: "Dinner", time: "19:00", hours: 2, color: "blue-100", description: "placeholder", icon: Utensils },
        { name: "Party", time: "20:00", hours: 3.5, color: "blue-100", description: "placeholder", icon: Music },
      ]
    },
    {
      day: "Sonntag",
      events: [
        { name: "Brunch", time: "11:00", hours: 2, color: "blue-100", description: "placeholder", icon: Utensils },
        { name: "Pool Time", time: "15:00", hours: 2, color: "blue-100", description: "placeholder", icon: Sun },
        { name: "BBQ", time: "19:00", hours: 2, color: "blue-100", description: "placeholder", icon: Utensils },
        { name: "Bingo Night", time: "21:00", hours: 4, color: "blue-100", description: "placeholder", icon: Utensils },
      ]
    },
    {
      day: "Montag",
      events: [
        { name: "Frühstück", time: "10:00", hours: 1, color: "blue-100", description: "placeholder", icon: Utensils },
        { name: "Aufräumen", time: "11:00", hours: 3, color: "yellow-100", description: "placeholder", icon: Sun }
      ]
    }
  ];

  // Find earliest and latest times across all events to determine time range
  let earliestTime = 24; // Initialize with maximum possible hour
  let latestEndTime = 0; // Initialize with minimum possible hour
  
  programItems.forEach(day => {
    day.events.forEach(event => {
      const startHour = timeToHours(event.time);
      const endHour = startHour + event.hours;
      
      if (startHour < earliestTime) earliestTime = startHour;
      if (endHour > latestEndTime) latestEndTime = endHour;
    });
  });
  
  // Round times to nearest hour for better display
  const startTime = Math.floor(earliestTime);
  const endTime = Math.ceil(latestEndTime);
  
  // Generate time markers with half-hour marks
  const timeMarkers = [];
  for (let hour = startTime; hour <= endTime; hour++) {
    // Full hour marker
    timeMarkers.push(
      <div 
        key={`${hour}:00`} 
        className="border-t border-gray-200 text-xs text-gray-500 relative"
        style={{ height: '30px' }}
      >
        <span className="absolute -top-2 -left-16 w-14 text-right">{`${hour.toString().padStart(2, '0')}:00`}</span>
      </div>
    );
    
    // Half hour marker (except for the last hour)
    if (hour < endTime) {
      timeMarkers.push(
        <div 
          key={`${hour}:30`} 
          className="border-t border-gray-200 border-dashed text-xs text-gray-500 relative"
          style={{ height: '30px' }}
        >
          <span className="absolute -top-2 -left-16 w-14 text-right text-gray-400">{`${hour.toString().padStart(2, '0')}:30`}</span>
        </div>
      );
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      <h2 className="text-3xl font-medium text-black mb-8">Programm</h2>
      
      {/* Day selector tabs */}
      <div className="flex space-x-2 border-b border-gray-200 mb-6">
        {programItems.map((day) => (
          <button
            key={day.day}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
              activeDay === day.day
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
            onClick={() => setActiveDay(day.day)}
          >
            {day.day}
          </button>
        ))}
      </div>
      
      {/* Time grid */}
      <div className="flex">
        {/* Time axis */}
        <div className="w-16 relative mr-4">
          {timeMarkers}
        </div>
        
        {/* Events container */}
        <div className="flex-1 relative min-h-96 border-l border-gray-200">
          {/* Time grid lines */}
          <div className="absolute inset-0">
            {timeMarkers.map((_, index) => (
              <div 
                key={index} 
                className={`border-t ${index % 2 === 0 ? 'border-gray-200' : 'border-gray-200 border-dashed'}`}
                style={{ height: '30px' }}
              />
            ))}
          </div>
          
          {/* Event items - positioned absolutely with conflict detection */}
          {(() => {
            const dayEvents = programItems.find(day => day.day === activeDay)?.events || [];
            
            // Find overlapping events
            const eventsWithConflicts = dayEvents.map((event, index) => {
              const eventStart = timeToHours(event.time);
              const eventEnd = eventStart + event.hours;
              
              // Check for overlaps with other events
              const conflicts = dayEvents.filter((otherEvent, otherIndex) => {
                if (index === otherIndex) return false;
                
                const otherStart = timeToHours(otherEvent.time);
                const otherEnd = otherStart + otherEvent.hours;
                
                // Check if events overlap
                return (eventStart < otherEnd && eventEnd > otherStart);
              });
              
              // Determine if this event has conflicts
              const hasConflict = conflicts.length > 0;
              
              // For events with conflicts, determine if they should be positioned left or right
              let conflictInfo = null;
              if (hasConflict) {
                // Find the conflicting event index
                const conflictIndex = dayEvents.findIndex((otherEvent, otherIndex) => {
                  if (index === otherIndex) return false;
                  
                  const otherStart = timeToHours(otherEvent.time);
                  const otherEnd = otherStart + otherEvent.hours;
                  
                  return (eventStart < otherEnd && eventEnd > otherStart);
                });
                
                // Position based on index comparison (first event goes left, second goes right)
                conflictInfo = {
                  position: index < conflictIndex ? 'left' : 'right'
                };
              }
              
              return {
                ...event,
                conflictInfo
              };
            });
            
            // Render events with proper positioning
            return eventsWithConflicts.map((event, index) => {
              const style = getEventStyle(event, event.conflictInfo);
              
              return (
                <div
                  key={index}
                  className={`absolute p-3 rounded-lg border shadow-sm transition-all hover:shadow-md ${getColorClass(event.color)}`}
                  style={style}
                >
                  <div className="flex items-start space-x-2">
                    <event.icon className="h-5 w-5 text-gray-600 mt-1 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start flex-wrap gap-1">
                        <p className="font-medium text-black truncate">{event.name}</p>
                        <span className="text-xs font-medium bg-white px-2 py-1 rounded-full whitespace-nowrap">
                          {event.time} ({event.hours}h)
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1 truncate">{event.description}</p>
                    </div>
                  </div>
                </div>
              );
            });
          })()}
        </div>
      </div>
      
      {/* Legend */}
      <div className="mt-8 flex items-center space-x-4 text-sm">
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-blue-100 border border-blue-200 mr-1"></div>
          <span>Activities</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-green-100 border border-green-200 mr-1"></div>
          <span>Food & Entertainment</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-yellow-100 border border-yellow-200 mr-1"></div>
          <span>Logistics</span>
        </div>
      </div>
    </div>
  );
}