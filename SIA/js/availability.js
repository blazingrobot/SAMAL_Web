// availability.js - Utility functions for company availability

class CompanyAvailability {
    constructor() {
        this.availability = this.loadAvailability();
    }

    loadAvailability() {
        const stored = localStorage.getItem('companyAvailability');
        if (stored) {
            return JSON.parse(stored);
        }
        
        // Default availability if none set
        return {
            workingHours: {
                monday: { start: '09:00', end: '17:00', available: true },
                tuesday: { start: '09:00', end: '17:00', available: true },
                wednesday: { start: '09:00', end: '17:00', available: true },
                thursday: { start: '09:00', end: '17:00', available: true },
                friday: { start: '09:00', end: '17:00', available: true },
                saturday: { start: '09:00', end: '12:00', available: false },
                sunday: { start: '00:00', end: '00:00', available: false }
            },
            blockedDates: [],
            lastUpdated: new Date().toISOString()
        };
    }

    // Check if a specific date is available
    isDateAvailable(date) {
        const dateStr = date.toISOString().split('T')[0];
        const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
        
        // Check if date is blocked
        if (this.availability.blockedDates.some(blocked => blocked.date === dateStr)) {
            return false;
        }

        // Check if day of week is available
        const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const dayName = days[dayOfWeek];
        return this.availability.workingHours[dayName]?.available || false;
    }

    // Get available time slots for a specific date
    getAvailableTimeSlots(date) {
        if (!this.isDateAvailable(date)) {
            return [];
        }

        const dayOfWeek = date.getDay();
        const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const dayName = days[dayOfWeek];
        const daySchedule = this.availability.workingHours[dayName];

        if (!daySchedule || !daySchedule.available) {
            return [];
        }

        return this.generateTimeSlots(daySchedule.start, daySchedule.end);
    }

    // Generate time slots based on start and end times
    generateTimeSlots(startTime, endTime) {
        const slots = [];
        const start = this.parseTime(startTime);
        const end = this.parseTime(endTime);
        
        let current = new Date(start);
        
        while (current < end) {
            const slotStart = this.formatTime(current);
            current.setHours(current.getHours() + 1);
            const slotEnd = this.formatTime(current);
            
            if (current <= end) {
                slots.push(`${slotStart} - ${slotEnd}`);
            }
        }
        
        return slots;
    }

    parseTime(timeString) {
        const [hours, minutes] = timeString.split(':').map(Number);
        const date = new Date();
        date.setHours(hours, minutes, 0, 0);
        return date;
    }

    formatTime(date) {
        return date.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: false 
        }).replace(':', '.');
    }

    // Get all unavailable dates for the next 6 months
    getUnavailableDates() {
        const unavailable = [];
        const blockedDates = this.availability.blockedDates.map(b => b.date);
        
        // Add blocked dates
        unavailable.push(...blockedDates);
        
        // Add days that are not available based on weekly schedule
        const today = new Date();
        for (let i = 0; i < 180; i++) { // Next 6 months
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            
            if (!this.isDateAvailable(date)) {
                const dateStr = date.toISOString().split('T')[0];
                if (!unavailable.includes(dateStr)) {
                    unavailable.push(dateStr);
                }
            }
        }
        
        return unavailable;
    }
}

// Create global instance
const companyAvailability = new CompanyAvailability();
