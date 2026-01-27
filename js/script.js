// ============================================
// GRAND AZURE HOTEL - MAIN JAVASCRIPT
// ============================================

// ============================================
// CONFIGURATION
// ============================================
const GOOGLE_FORM_CONFIG = {
    // ⚠️ REPLACE WITH YOUR GOOGLE FORM ACTION URL (e.g., https://docs.google.com/forms/d/e/.../formResponse)
    ACTION_URL: 'https://docs.google.com/forms/d/e/YOUR_FORM_ID_HERE/formResponse',

    // ⚠️ REPLACE WITH YOUR ENTRY IDs (e.g., entry.123456)
    CONTACT_MAPPING: {
        firstName: 'entry.EXAMPLE_FIRSTNAME',
        lastName: 'entry.EXAMPLE_LASTNAME',
        email: 'entry.EXAMPLE_EMAIL',
        phone: 'entry.EXAMPLE_PHONE',
        subject: 'entry.EXAMPLE_SUBJECT',
        message: 'entry.EXAMPLE_MESSAGE'
    },

    BOOKING_MAPPING: {
        checkIn: 'entry.EXAMPLE_CHECKIN',
        checkOut: 'entry.EXAMPLE_CHECKOUT',
        roomType: 'entry.EXAMPLE_ROOMTYPE',
        adults: 'entry.EXAMPLE_ADULTS',
        children: 'entry.EXAMPLE_CHILDREN',
        fullName: 'entry.EXAMPLE_FULLNAME',
        email: 'entry.EXAMPLE_BOOKING_EMAIL',
        phone: 'entry.EXAMPLE_BOOKING_PHONE',
        specialRequests: 'entry.EXAMPLE_REQUESTS',
        // Calculated fields (optional - add these to your Google Form if you want to track them)
        totalPrice: 'entry.EXAMPLE_TOTAL',
        nights: 'entry.EXAMPLE_NIGHTS'
    }
};

// ============================================
// NAVIGATION
// ============================================
document.addEventListener('DOMContentLoaded', function () {
    const navbar = document.getElementById('navbar');
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');

    // Sticky Navbar on Scroll
    window.addEventListener('scroll', function () {
        if (window.scrollY > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Mobile Menu Toggle
    if (hamburger) {
        hamburger.addEventListener('click', function () {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        // Close menu when clicking on a link
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', function () {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', function (event) {
            if (!hamburger.contains(event.target) && !navMenu.contains(event.target)) {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            }
        });
    }

    // ============================================
    // SCROLL ANIMATIONS
    // ============================================
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function (entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe all fade-up elements
    const fadeUpElements = document.querySelectorAll('.fade-up');
    fadeUpElements.forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(50px)';
        element.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
        observer.observe(element);
    });

    // ============================================
    // GALLERY FILTERS
    // ============================================
    const filterButtons = document.querySelectorAll('.filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');

    if (filterButtons.length > 0) {
        filterButtons.forEach(button => {
            button.addEventListener('click', function () {
                // Remove active class from all buttons
                filterButtons.forEach(btn => btn.classList.remove('active'));

                // Add active class to clicked button
                this.classList.add('active');

                const filterValue = this.getAttribute('data-filter');

                // Show/hide gallery items based on filter
                galleryItems.forEach(item => {
                    const itemCategory = item.closest('[data-category]');
                    if (itemCategory) {
                        const category = itemCategory.getAttribute('data-category');

                        if (filterValue === 'all' || filterValue === category) {
                            item.style.display = 'block';
                            setTimeout(() => {
                                item.style.opacity = '1';
                                item.style.transform = 'scale(1)';
                            }, 10);
                        } else {
                            item.style.opacity = '0';
                            item.style.transform = 'scale(0.8)';
                            setTimeout(() => {
                                item.style.display = 'none';
                            }, 300);
                        }
                    }
                });
            });
        });
    }

    // ============================================
    // CONTACT FORM VALIDATION & SUBMISSION
    // ============================================
    const contactForm = document.getElementById('contactForm');
    const formMessage = document.getElementById('formMessage');

    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();

            // Get form values
            const firstName = document.getElementById('firstName').value.trim();
            const lastName = document.getElementById('lastName').value.trim();
            const email = document.getElementById('email').value.trim();
            const subject = document.getElementById('subject').value;
            const message = document.getElementById('message').value.trim();

            // Validation
            if (!firstName || !lastName || !email || !subject || !message) {
                showMessage('Please fill in all required fields.', 'error');
                return;
            }

            if (!isValidEmail(email)) {
                showMessage('Please enter a valid email address.', 'error');
                return;
            }

            // Submit to Google Sheets
            const formData = new FormData();
            formData.append(GOOGLE_FORM_CONFIG.CONTACT_MAPPING.firstName, firstName);
            formData.append(GOOGLE_FORM_CONFIG.CONTACT_MAPPING.lastName, lastName);
            formData.append(GOOGLE_FORM_CONFIG.CONTACT_MAPPING.email, email);
            formData.append(GOOGLE_FORM_CONFIG.CONTACT_MAPPING.phone, document.getElementById('phone').value.trim()); // Use raw value for optional fields
            formData.append(GOOGLE_FORM_CONFIG.CONTACT_MAPPING.subject, subject);
            formData.append(GOOGLE_FORM_CONFIG.CONTACT_MAPPING.message, message);

            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerHTML;

            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
            submitBtn.disabled = true;

            fetch(GOOGLE_FORM_CONFIG.ACTION_URL, {
                method: 'POST',
                mode: 'no-cors',
                body: formData
            })
                .then(() => {
                    showMessage('Thank you for your message! We will get back to you within 24 hours.', 'success');
                    contactForm.reset();
                    setTimeout(() => {
                        formMessage.style.display = 'none';
                    }, 5000);
                })
                .catch(error => {
                    console.error('Error:', error);
                    showMessage('There was an error sending your message. Please try again later.', 'error');
                })
                .finally(() => {
                    submitBtn.innerHTML = originalBtnText;
                    submitBtn.disabled = false;
                });
        });
    }

    // ============================================
    // BOOKING FORM FUNCTIONALITY
    // ============================================
    const bookingForm = document.getElementById('bookingForm');
    const checkInInput = document.getElementById('checkIn');
    const checkOutInput = document.getElementById('checkOut');
    const roomTypeSelect = document.getElementById('roomType');
    const nightsDisplay = document.getElementById('nightsDisplay');
    const rateDisplay = document.getElementById('rateDisplay');
    const totalDisplay = document.getElementById('totalDisplay');
    const bookingMessage = document.getElementById('bookingMessage');

    // Set minimum date to today
    if (checkInInput && checkOutInput && roomTypeSelect) {
        const today = new Date().toISOString().split('T')[0];
        checkInInput.setAttribute('min', today);
        checkOutInput.setAttribute('min', today);

        // Update check-out minimum when check-in changes
        checkInInput.addEventListener('change', function () {
            const checkInDate = new Date(this.value);
            checkInDate.setDate(checkInDate.getDate() + 1);
            checkOutInput.setAttribute('min', checkInDate.toISOString().split('T')[0]);
            calculateTotal();
        });

        checkOutInput.addEventListener('change', calculateTotal);
        roomTypeSelect.addEventListener('change', calculateTotal);
    }

    function calculateTotal() {
        const checkIn = new Date(checkInInput.value);
        const checkOut = new Date(checkOutInput.value);
        const roomType = roomTypeSelect.value;

        // Ensure display elements exist
        if (!nightsDisplay || !rateDisplay || !totalDisplay) return;

        if (!checkInInput.value || !checkOutInput.value || !roomType) {
            nightsDisplay.textContent = '-';
            rateDisplay.textContent = '-';
            totalDisplay.textContent = '$0';
            return;
        }

        // Calculate number of nights
        const timeDiff = checkOut - checkIn;
        const nights = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

        if (nights < 1) {
            nightsDisplay.textContent = '-';
            rateDisplay.textContent = '-';
            totalDisplay.textContent = '$0';
            return;
        }

        // Get room price
        const selectedOption = roomTypeSelect.options[roomTypeSelect.selectedIndex];
        const pricePerNight = parseInt(selectedOption.getAttribute('data-price'));

        // Calculate total
        const total = nights * pricePerNight;

        // Update display
        nightsDisplay.textContent = nights + (nights === 1 ? ' night' : ' nights');
        rateDisplay.textContent = '$' + pricePerNight + '/night';
        totalDisplay.textContent = '$' + total.toLocaleString();
    }

    if (bookingForm) {
        bookingForm.addEventListener('submit', function (e) {
            e.preventDefault();

            // Get form values
            const checkIn = checkInInput.value;
            const checkOut = checkOutInput.value;
            const roomType = roomTypeSelect.options[roomTypeSelect.selectedIndex].text;
            const fullName = document.getElementById('fullName').value.trim();
            const email = document.getElementById('email').value.trim();
            const phone = document.getElementById('phone').value.trim();

            // Validation
            if (!checkIn || !checkOut) {
                showBookingMessage('Please select check-in and check-out dates.', 'error');
                return;
            }

            if (new Date(checkOut) <= new Date(checkIn)) {
                showBookingMessage('Check-out date must be after check-in date.', 'error');
                return;
            }

            if (!roomTypeSelect.value) {
                showBookingMessage('Please select a room type.', 'error');
                return;
            }

            if (!fullName || !email || !phone) {
                showBookingMessage('Please fill in all required fields.', 'error');
                return;
            }

            if (!isValidEmail(email)) {
                showBookingMessage('Please enter a valid email address.', 'error');
                return;
            }

            // Calculate nights and total
            const checkInDate = new Date(checkIn);
            const checkOutDate = new Date(checkOut);
            const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
            const total = totalDisplay.textContent;

            // Submit to Google Sheets
            const formData = new FormData();
            formData.append(GOOGLE_FORM_CONFIG.BOOKING_MAPPING.checkIn, checkIn);
            formData.append(GOOGLE_FORM_CONFIG.BOOKING_MAPPING.checkOut, checkOut);
            formData.append(GOOGLE_FORM_CONFIG.BOOKING_MAPPING.roomType, roomType);
            formData.append(GOOGLE_FORM_CONFIG.BOOKING_MAPPING.adults, document.getElementById('adults').value);
            formData.append(GOOGLE_FORM_CONFIG.BOOKING_MAPPING.children, document.getElementById('children').value);
            formData.append(GOOGLE_FORM_CONFIG.BOOKING_MAPPING.fullName, fullName);
            formData.append(GOOGLE_FORM_CONFIG.BOOKING_MAPPING.email, email);
            formData.append(GOOGLE_FORM_CONFIG.BOOKING_MAPPING.phone, phone);
            formData.append(GOOGLE_FORM_CONFIG.BOOKING_MAPPING.specialRequests, document.getElementById('specialRequests').value.trim());
            // Calculated fields
            formData.append(GOOGLE_FORM_CONFIG.BOOKING_MAPPING.totalPrice, total);
            formData.append(GOOGLE_FORM_CONFIG.BOOKING_MAPPING.nights, nights);

            const submitBtn = bookingForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerHTML;

            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
            submitBtn.disabled = true;

            fetch(GOOGLE_FORM_CONFIG.ACTION_URL, {
                method: 'POST',
                mode: 'no-cors',
                body: formData
            })
                .then(() => {
                    // Show confirmation
                    const confirmationMessage = `
                    <strong>Booking Confirmed!</strong><br>
                    Thank you, ${fullName}!<br><br>
                    <strong>Reservation Details:</strong><br>
                    Room: ${roomType}<br>
                    Check-in: ${formatDate(checkIn)}<br>
                    Check-out: ${formatDate(checkOut)}<br>
                    Nights: ${nights}<br>
                    Total: ${total}<br><br>
                    A confirmation email has been sent to ${email}
                `;

                    showBookingMessage(confirmationMessage, 'success');

                    // Scroll to message
                    bookingMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });

                    // Reset form after 3 seconds
                    setTimeout(() => {
                        bookingForm.reset();
                        nightsDisplay.textContent = '-';
                        rateDisplay.textContent = '-';
                        totalDisplay.textContent = '$0';
                        bookingMessage.style.display = 'none'; // Hide message when resetting
                    }, 5000); // Increased to 5s to give time to read
                })
                .catch(error => {
                    console.error('Error:', error);
                    showBookingMessage('There was an error processing your booking. If the problem persists, please call us.', 'error');
                })
                .finally(() => {
                    submitBtn.innerHTML = originalBtnText;
                    submitBtn.disabled = false;
                });

            return; // Stop execution here, the fetch handles the rest
        });
    }

    // ============================================
    // ROOM DETAILS MODAL
    // ============================================
    const viewDetailsButtons = document.querySelectorAll('.btn-view-details');

    viewDetailsButtons.forEach(button => {
        button.addEventListener('click', function () {
            const roomName = this.getAttribute('data-room');
            alert(`View details for ${roomName}\n\nThis would typically open a modal with detailed information, high-resolution images, and booking options.`);
        });
    });

    // ============================================
    // HELPER FUNCTIONS
    // ============================================
    function showMessage(message, type) {
        if (formMessage) {
            formMessage.textContent = message;
            formMessage.className = 'form-message ' + type;
            formMessage.style.display = 'block';
        }
    }

    function showBookingMessage(message, type) {
        if (bookingMessage) {
            bookingMessage.innerHTML = message;
            bookingMessage.className = 'booking-message ' + type;
            bookingMessage.style.display = 'block';
        }
    }

    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    function formatDate(dateString) {
        const date = new Date(dateString);
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    }

    // ============================================
    // SMOOTH SCROLL FOR ANCHOR LINKS
    // ============================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href !== '#') {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });

    // ============================================
    // LOADING ANIMATION FOR IMAGES
    // ============================================
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        img.addEventListener('load', function () {
            this.style.opacity = '1';
        });

        // If image is already cached
        if (img.complete) {
            img.style.opacity = '1';
        } else {
            img.style.opacity = '0';
            img.style.transition = 'opacity 0.5s ease';
        }
    });

    // ============================================
    // CONSOLE MESSAGE
    // ============================================
    console.log('%c Welcome to The Grand Azure Hotel ', 'background: #1a2942; color: #d4af37; font-size: 20px; padding: 10px;');
    console.log('%c Where Elegance Meets Exceptional Hospitality ', 'background: #d4af37; color: #ffffff; font-size: 14px; padding: 5px;');
});