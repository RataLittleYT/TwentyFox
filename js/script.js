document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const nav = document.querySelector('.nav');
    
    menuToggle.addEventListener('click', function() {
        this.classList.toggle('active');
        nav.classList.toggle('active');
    });
    
    // Smooth scrolling for navigation links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Close mobile menu if open
            menuToggle.classList.remove('active');
            nav.classList.remove('active');
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            window.scrollTo({
                top: targetElement.offsetTop - 80,
                behavior: 'smooth'
            });
            
            // Update active link
            document.querySelectorAll('.nav-link').forEach(navLink => {
                navLink.classList.remove('active');
            });
            this.classList.add('active');
        });
    });
    
    // Change header style on scroll
    const header = document.querySelector('.header');
    
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
    
    // Service buttons in contact section
    const serviceButtons = document.querySelectorAll('.btn-service');
    const phoneNumber = document.querySelector('.phone-number');
    const emailAddress = document.querySelector('.email-address');
    
    serviceButtons.forEach(button => {
        button.addEventListener('click', function() {
            serviceButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            if (this.classList.contains('btn-psico')) {
                phoneNumber.textContent = '55 1234 5678 (Psicología)';
                emailAddress.textContent = 'psicologia@clinicaserenidad.com';
            } else if (this.classList.contains('btn-estoma')) {
                phoneNumber.textContent = '55 2345 6789 (Estomatología)';
                emailAddress.textContent = 'estomatologia@clinicaserenidad.com';
            } else if (this.classList.contains('btn-derecho')) {
                phoneNumber.textContent = '55 3456 7890 (Derecho)';
                emailAddress.textContent = 'derecho@clinicaserenidad.com';
            }
        });
    });
    
    // Form submission
    const contactForm = document.getElementById('contactForm');
    const formSuccess = document.getElementById('formSuccess');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Simulate form submission (in a real scenario, you would use Formspree)
            const formData = new FormData(this);
            
            // Show loading state
            const submitBtn = this.querySelector('button[type="submit"]');
            const btnText = submitBtn.querySelector('.btn-text');
            const btnIcon = submitBtn.querySelector('.btn-icon');
            
            btnText.textContent = 'Enviando...';
            btnIcon.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
            
            // Simulate API call delay
            setTimeout(() => {
                // Hide form and show success message
                contactForm.style.display = 'none';
                formSuccess.style.display = 'block';
                
                // Reset form
                this.reset();
                
                // Reset button (though form is hidden)
                btnText.textContent = 'Enviar mensaje';
                btnIcon.innerHTML = '<i class="fas fa-paper-plane"></i>';
                
                // Hide success message after 5 seconds and show form again
                setTimeout(() => {
                    formSuccess.style.display = 'none';
                    contactForm.style.display = 'block';
                }, 5000);
            }, 1500);
        });
    }
    
    // Scroll animations
    function checkScroll() {
        const elements = document.querySelectorAll('.animate-on-scroll');
        
        elements.forEach(element => {
            const elementPosition = element.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;
            
            if (elementPosition < windowHeight - 100) {
                element.classList.add('animated');
            }
        });
    }
    
    // Initial check
    checkScroll();
    
    // Check on scroll
    window.addEventListener('scroll', checkScroll);
    
    // Parallax effect
    function setupParallax() {
        const parallaxElements = document.querySelectorAll('[data-parallax]');
        
        window.addEventListener('scroll', function() {
            const scrollPosition = window.pageYOffset;
            
            parallaxElements.forEach(element => {
                const parallaxSpeed = parseFloat(element.getAttribute('data-parallax')) || 0.3;
                const elementOffset = element.offsetTop;
                const elementHeight = element.offsetHeight;
                
                if (scrollPosition > elementOffset - window.innerHeight && 
                    scrollPosition < elementOffset + elementHeight) {
                    const diff = scrollPosition - elementOffset;
                    const scrollPercent = diff / window.innerHeight;
                    const move = scrollPercent * 100 * parallaxSpeed;
                    
                    element.style.transform = `translateY(${move}px)`;
                }
            });
        });
    }
    
    // Apply parallax to hero image
    const heroImage = document.querySelector('.hero-image');
    if (heroImage) {
        heroImage.setAttribute('data-parallax', '0.2');
        setupParallax();
    }
    
    // Update active nav link on scroll
    const sections = document.querySelectorAll('section');
    
    window.addEventListener('scroll', function() {
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            
            if (pageYOffset >= sectionTop - 100) {
                current = section.getAttribute('id');
            }
        });
        
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });
    
    // Initialize animations on load
    setTimeout(() => {
        checkScroll();
    }, 500);
});