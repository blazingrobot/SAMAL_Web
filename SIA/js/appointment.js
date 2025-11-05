// appointment.js - Updated to use company availability
document.addEventListener("DOMContentLoaded", function () {
    // Calendar elements
    const calendar = document.getElementById("calendar");
    const monthYear = document.getElementById("monthYear");
    const prevMonthBtn = document.getElementById("prevMonth");
    const nextMonthBtn = document.getElementById("nextMonth");

    // Form elements
    const appointmentForm = document.getElementById("appointmentForm");
    const cancelBtn = document.querySelector(".cancel-btn");

    // Time slots container
    const timeSlotsContainer = document.querySelector(".time-slots");

    // Selected values
    let selectedDate = null;
    let selectedTime = null;

    // Current date
    let today = new Date();
    let currentMonth = today.getMonth();
    let currentYear = today.getFullYear();

    // Company availability
    const availability = new CompanyAvailability();

    // Render the calendar with availability
    function renderCalendar(month, year) {
        calendar.innerHTML = "";

        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        monthYear.textContent = new Date(year, month).toLocaleString("default", {
            month: "long",
            year: "numeric",
        });

        // Create empty cells for days before the first day of the month
        for (let i = 0; i < firstDay; i++) {
            const empty = document.createElement("div");
            calendar.appendChild(empty);
        }

        // Create cells for each day of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const cell = document.createElement("div");
            cell.classList.add("calendar-day");
            cell.textContent = day;
            const date = new Date(year, month, day);

            // Check if date is in the past
            if (date < new Date(new Date().setHours(0, 0, 0, 0))) {
                cell.classList.add("past");
                cell.title = "Past date";
            }
            // Check if date is unavailable
            else if (!availability.isDateAvailable(date)) {
                cell.classList.add("unavailable");
                cell.title = "Not available";
            }
            // Check if today
            else if (
                day === today.getDate() &&
                month === today.getMonth() &&
                year === today.getFullYear()
            ) {
                cell.classList.add("today");
                cell.title = "Today - Available";
            }
            // Available date
            else {
                cell.title = "Available";
            }

            cell.addEventListener("click", function () {
                if (cell.classList.contains("past") || cell.classList.contains("unavailable")) {
                    return;
                }

                document.querySelectorAll(".calendar-day").forEach((d) =>
                    d.classList.remove("selected")
                );
                cell.classList.add("selected");
                selectedDate = date;
                
                // Update time slots for selected date
                updateTimeSlots(selectedDate);
                updateSelectedDateTimeDisplay();
            });

            calendar.appendChild(cell);
        }
    }

    // Update time slots based on selected date
    function updateTimeSlots(date) {
        // Clear current time slots
        timeSlotsContainer.innerHTML = "";
        
        // Get available time slots for the selected date
        const availableSlots = availability.getAvailableTimeSlots(date);
        
        if (availableSlots.length === 0) {
            timeSlotsContainer.innerHTML = '<div class="no-slots">No available time slots for this date</div>';
            selectedTime = null;
            return;
        }

        // Create time slot buttons
        availableSlots.forEach(slot => {
            const button = document.createElement("button");
            button.classList.add("time-btn");
            button.textContent = slot;
            
            button.addEventListener("click", function () {
                document.querySelectorAll(".time-btn").forEach((b) => b.classList.remove("selected"));
                button.classList.add("selected");
                selectedTime = slot;
                updateSelectedDateTimeDisplay();
            });
            
            timeSlotsContainer.appendChild(button);
        });

        // Reset selected time
        selectedTime = null;
        updateSelectedDateTimeDisplay();
    }

    // Update date & time display fields
    function updateSelectedDateTimeDisplay() {
        const selectedDateInput = document.getElementById("selectedDateInput");
        const selectedTimeInput = document.getElementById("selectedTimeInput");

        if (selectedDate) {
            selectedDateInput.value = selectedDate.toLocaleDateString("en-US", {
                weekday: "short",
                year: "numeric",
                month: "short",
                day: "numeric",
            });
        } else {
            selectedDateInput.value = "";
        }

        if (selectedTime) {
            selectedTimeInput.value = selectedTime;
        } else {
            selectedTimeInput.value = "";
        }
    }

    // Handle month navigation
    prevMonthBtn.addEventListener("click", function () {
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        renderCalendar(currentMonth, currentYear);
    });

    nextMonthBtn.addEventListener("click", function () {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        renderCalendar(currentMonth, currentYear);
    });

    // Show summary modal
    function showSummaryModal() {
        const firstName = document.querySelector('input[name="first_name"]').value;
        const lastName = document.querySelector('input[name="last_name"]').value;
        const email = document.querySelector('input[name="email"]').value;
        const phone = document.querySelector('input[name="phone"]').value;
        const service = document.querySelector('select[name="service"]').value;
        
        const summaryModal = document.createElement('div');
        summaryModal.className = 'modal';
        summaryModal.id = 'summaryModal';
        summaryModal.style.display = 'flex';
        
        summaryModal.innerHTML = `
            <div class="modal-content">
                <span class="close summary-close">&times;</span>
                <h3>Appointment Summary</h3>
                <div class="summary-content">
                    <div class="summary-item">
                        <span class="summary-label">Name:</span>
                        <span class="summary-value">${firstName} ${lastName}</span>
                    </div>
                    <div class="summary-item">
                        <span class="summary-label">Email:</span>
                        <span class="summary-value">${email}</span>
                    </div>
                    <div class="summary-item">
                        <span class="summary-label">Phone:</span>
                        <span class="summary-value">${phone}</span>
                    </div>
                    <div class="summary-item">
                        <span class="summary-label">Service:</span>
                        <span class="summary-value">${service}</span>
                    </div>
                    <div class="summary-item">
                        <span class="summary-label">Date:</span>
                        <span class="summary-value">${selectedDate ? selectedDate.toLocaleDateString("en-US", {
                            weekday: "short",
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                        }) : ''}</span>
                    </div>
                    <div class="summary-item">
                        <span class="summary-label">Time:</span>
                        <span class="summary-value">${selectedTime || ''}</span>
                    </div>
                </div>
                <div class="modal-actions">
                    <button type="button" class="modal-btn cancel-modal-btn" id="editSummary">Edit</button>
                    <button type="button" class="modal-btn confirm-btn" id="confirmBooking">Confirm Booking</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(summaryModal);
        
        // Close summary modal
        document.querySelector('.summary-close').addEventListener('click', function() {
            document.body.removeChild(summaryModal);
        });
        
        // Edit button
        document.getElementById('editSummary').addEventListener('click', function() {
            document.body.removeChild(summaryModal);
        });
        
        // Confirm button - show success modal
        document.getElementById('confirmBooking').addEventListener('click', function() {
            document.body.removeChild(summaryModal);
            showSuccessModal();
        });
        
        // Close when clicking outside
        summaryModal.addEventListener('click', function(event) {
            if (event.target === summaryModal) {
                document.body.removeChild(summaryModal);
            }
        });
    }

    // Show success modal
    function showSuccessModal() {
        const firstName = document.querySelector('input[name="first_name"]').value;
        const lastName = document.querySelector('input[name="last_name"]').value;
        const email = document.querySelector('input[name="email"]').value;
        
        const successModal = document.createElement('div');
        successModal.className = 'modal';
        successModal.id = 'successModal';
        successModal.style.display = 'flex';
        
        successModal.innerHTML = `
            <div class="modal-content">
                <div class="success-message">
                    <div class="success-icon">✓</div>
                    <h3>Check your Email for updates</h3>
                    <p>Your appointment has been booked successfully for <strong>${firstName} ${lastName}</strong>.</p>
                    <p>We've sent a confirmation email to <strong>${email}</strong> with all the details.</p>
                    <p>Please check your inbox (and spam folder) for the confirmation.</p>
                </div>
                <div class="modal-actions">
                    <button type="button" class="modal-btn confirm-btn" id="closeSuccess">Close</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(successModal);
        
        // Close success modal and submit form to PHP
        document.getElementById('closeSuccess').addEventListener('click', function() {
            document.body.removeChild(successModal);
            // Submit form to PHP with reCAPTCHA data
            appointmentForm.submit();
        });
        
        // Close when clicking outside
        successModal.addEventListener('click', function(event) {
            if (event.target === successModal) {
                document.body.removeChild(successModal);
                // Submit form to PHP with reCAPTCHA data
                appointmentForm.submit();
            }
        });
    }

    // Reset form
    function resetForm() {
        appointmentForm.reset();
        selectedDate = null;
        selectedTime = null;
        document.querySelectorAll(".calendar-day").forEach((d) =>
            d.classList.remove("selected")
        );
        timeSlotsContainer.innerHTML = '<div class="no-slots">Select a date to see available times</div>';
        updateSelectedDateTimeDisplay();
        
        // Reset reCAPTCHA
        if (typeof grecaptcha !== 'undefined') {
            grecaptcha.reset();
        }
    }

    // Handle form submission (show summary modal)
    appointmentForm.addEventListener("submit", function (e) {
        e.preventDefault();

        if (!selectedDate || !selectedTime) {
            alert("Please select both a date and time before booking.");
            return;
        }

        // Check if reCAPTCHA is completed
        if (typeof grecaptcha !== 'undefined') {
            const recaptchaResponse = grecaptcha.getResponse();
            if (!recaptchaResponse) {
                alert("Please complete the reCAPTCHA verification.");
                return;
            }
        }

        // Show summary modal
        showSummaryModal();
    });

    // Cancel button
    cancelBtn.addEventListener("click", function () {
        resetForm();
    });

    // Initialize
    renderCalendar(currentMonth, currentYear);
    updateSelectedDateTimeDisplay();
    timeSlotsContainer.innerHTML = '<div class="no-slots">Select a date to see available times</div>';
});