document.addEventListener('DOMContentLoaded', () => {
    const cursor = document.querySelector('.custom-cursor');
    const interactives = document.querySelectorAll('.interactive, a, button');
    
    // 마우스 커서 따라오는 변수 설정
    let mouseX = 0;
    let mouseY = 0;
    let cursorX = 0;
    let cursorY = 0;

    // 마우스 포지션 업데이트
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;

        cursor.style.opacity = 1;
    });

    // 마우스 커서 애니메이션 함수
    function animateCursor() {
        // lerp 계산: 현재 위치 + (목표 위치 - 현재 위치) * 속도
        cursorX += (mouseX - cursorX) * 0.5;
        cursorY += (mouseY - cursorY) * 0.5;

        cursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0) translate(-50%, -50%)`;
        
        requestAnimationFrame(animateCursor);
    }

    const isTouchDevice = window.matchMedia("(pointer: coarse)").matches;
    
    if (!isTouchDevice) {
        animateCursor();
    }

    // 마우스 커서 인터랙티브 요소 반응
    interactives.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursor.style.width = '70px';
            cursor.style.height = '70px';
            cursor.style.backgroundColor = 'rgba(255, 77, 0, 0.1)';
            cursor.style.borderColor = 'rgba(255, 77, 0, 0.4)';
        });
        
        el.addEventListener('mouseleave', () => {
            cursor.style.width = '40px';
            cursor.style.height = '40px';
            cursor.style.backgroundColor = 'transparent';
            cursor.style.borderColor = 'var(--primary)';
        });
    });

    // --- Navbar 업데이트하고 문의하기 버튼 토글---

    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');

    const observerOptions = {
        threshold: 0, 
        rootMargin: "-50% 0px -50% 0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                navLinks.forEach(link => link.classList.remove('active'));

                const id = entry.target.getAttribute('id');
                const activeLink = document.querySelector(`.nav-link[href="#${id}"]`);

                if(activeLink) {
                    activeLink.classList.add('active');
                }

                // "문의하기" 버튼 토글
                const contactBtn = document.querySelector('.get-started-btn');
                if (contactBtn) {
                    if (id === 'contact') {
                        contactBtn.style.opacity = '0';
                        contactBtn.style.pointerEvents = 'none';
                    } else {
                        contactBtn.style.opacity = '1';
                        contactBtn.style.pointerEvents = 'auto';
                    }
                }
            }
        });
    }, observerOptions);

    sections.forEach(section => {
        observer.observe(section);
    });

    // 스탯
    const statsSection = document.querySelector('.stats-banner');
    const counters = document.querySelectorAll('.stat-big-number');
    let started = false; 

    if (statsSection && counters.length > 0) {
        const statsObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    statsSection.classList.add('visible');

                    if (!started) {
                        counters.forEach(counter => {
                            const target = +counter.getAttribute('data-target');
                            const duration = 500;
                            const increment = target / (duration / 13); 

                            let current = 0;
                            const updateCounter = () => {
                                current += increment;
                                if (current < target) {
                                    if (Math.floor(target) !== target) {
                                        counter.innerText = current.toFixed(1);
                                    } else {
                                        counter.innerText = Math.ceil(current);
                                    }
                                    requestAnimationFrame(updateCounter);
                                } else {
                                    counter.innerText = target; 
                                }
                            };
                            updateCounter();
                        });
                        started = true;
                    }
                }
            });
        }, { threshold: 0.5 });

        statsObserver.observe(statsSection);
    }
    
    // 갤러리
    const gallerySection = document.querySelector('#gallery');
    const galleryItems = document.querySelectorAll('.gallery-track .item');

    if (gallerySection && galleryItems.length > 0) {
        
        window.addEventListener('scroll', () => {
            const rect = gallerySection.getBoundingClientRect();
            const sectionHeight = gallerySection.offsetHeight;
            const windowHeight = window.innerHeight;
            
            // 갤러리 섹션 상단이 현재 뷰 상단에서 얼마나 스크롤되었는지 계산
            const scrolled = -rect.top;
            
            if (scrolled < 0) {
                updateGallery(0);
                return;
            }
            if (scrolled > (sectionHeight - windowHeight)) {
                // 유저가 섹션을 지났을 경우 마지막 이미지 표시
                updateGallery(galleryItems.length - 1);
                return;
            }

            // 스크롤시 한계점 계산
            const totalScrollableDistance = sectionHeight - windowHeight;
            const stepSize = totalScrollableDistance / galleryItems.length;
            let activeIndex = Math.floor(scrolled / stepSize);

            if (activeIndex < 0) activeIndex = 0;
            if (activeIndex >= galleryItems.length) activeIndex = galleryItems.length - 1;

            updateGallery(activeIndex);
        });

        function updateGallery(activeIndex) {
            galleryItems.forEach((item, index) => {
                item.classList.remove('active', 'prev', 'next', 'waiting');

                if (index === activeIndex) {
                    item.classList.add('active'); 
                } else if (index < activeIndex) {
                    item.classList.add('prev');  
                } else {
                    item.classList.add('waiting');
                }
            });
        }
    }

    // 네비게이션 버튼으로 work class 캐러셀 스크롤

    const carousel = document.querySelector('.work-carousel');
    const nextBtn = document.querySelector('.next-btn');
    const prevBtn = document.querySelector('.prev-btn');

    const scrollAmount = 370; 

    if (carousel && nextBtn && prevBtn) {
        const updateButtonState = () => {
            prevBtn.disabled = carousel.scrollLeft <= 0;

            const isAtEnd = carousel.scrollLeft + carousel.clientWidth >= carousel.scrollWidth - 1;
            nextBtn.disabled = isAtEnd;
        };
        
        nextBtn.addEventListener('click', () => {
            carousel.scrollBy({ 
                left: scrollAmount, 
                behavior: 'smooth' 
            });
        });

        prevBtn.addEventListener('click', () => {
            carousel.scrollBy({ 
                left: -scrollAmount, 
                behavior: 'smooth' 
            });
        });

        carousel.addEventListener('scroll', updateButtonState);

        updateButtonState();
    }

    // work 제품 할인율 자동 계산
    function calculateDiscounts() {
        const productCards = document.querySelectorAll('.project-card');

        productCards.forEach(card => {
            const originalPriceEl = card.querySelector('.original-price');
            const discountPriceEl = card.querySelector('.discount-price');
            const badgeEl = card.querySelector('.discount-badge');

            if (originalPriceEl && discountPriceEl && badgeEl) {
                
                const originalPrice = parseInt(originalPriceEl.innerText.replace(/[^0-9]/g, ''), 10);
                const discountPrice = parseInt(discountPriceEl.innerText.replace(/[^0-9]/g, ''), 10);

                if (originalPrice > 0 && discountPrice >= 0) {
                    const discountPercentage = Math.round(((originalPrice - discountPrice) / originalPrice) * 100);
                    badgeEl.innerText = `${discountPercentage}% OFF`;
                }
            }
        });
    }

    calculateDiscounts();

    // 서비스 2 스크롤 섹션

    const horizontalSection = document.querySelector('.horizontal-scroll-section');
    const horizontalTrack = document.querySelector('.horizontal-track');
    let isTicking = false;
    let maxScroll = 0;

    function updateScrollMetrics() {
        if (horizontalSection) {
            maxScroll = horizontalSection.offsetHeight - window.innerHeight;
        }
    }

    if (horizontalSection && horizontalTrack) {
        updateScrollMetrics();

        window.addEventListener('resize', updateScrollMetrics);

        window.addEventListener('scroll', () => {
            if (!isTicking) {
                window.requestAnimationFrame(() => {
                    const rect = horizontalSection.getBoundingClientRect();
                    const scrollProgress = -rect.top;

                    if (scrollProgress >= 0 && scrollProgress <= maxScroll) {
                        const percentage = scrollProgress / maxScroll;
                        const moveAmount = percentage * 200; 
                        horizontalTrack.style.transform = `translate3d(-${moveAmount}vw, 0, 0)`;
                    } else if (scrollProgress < 0) {
                        horizontalTrack.style.transform = `translate3d(0, 0, 0)`;
                    } else if (scrollProgress > maxScroll) {
                        horizontalTrack.style.transform = `translate3d(-200vw, 0, 0)`;
                    }

                    isTicking = false;
                });
                isTicking = true;
            }
        }, { passive: true });
    }

    // 리뷰  캐러셀 
    
    const reviewTrack = document.querySelector('.review-track');
    const reviewSlides = document.querySelectorAll('.review-slide');
    const indicators = document.querySelectorAll('.indicator');
    const reviewPrevBtn = document.querySelector('.review-carousel-container .prev-btn');
    const reviewNextBtn = document.querySelector('.review-carousel-container .next-btn');

    if (reviewTrack && reviewSlides.length > 0) {
        const scrollToSlide = (index) => {
            const slide = reviewSlides[index];
            if (!slide) return;

            const scrollAmount = slide.offsetLeft - (reviewTrack.clientWidth / 2) + (slide.offsetWidth / 2);
            
            reviewTrack.scrollTo({
                left: scrollAmount,
                behavior: 'smooth'
            });
        };

        indicators.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                scrollToSlide(index);
            });
        });

        if (reviewPrevBtn && reviewNextBtn) {
            const getCiurrentIndex = () => {
                const center = reviewTrack.scrollLeft + (reviewTrack.offsetWidth / 2);
                let closestIndex = 0;
                let minDistance = Infinity;

                reviewSlides.forEach((slide, index) => {
                    const slideCenter = slide.offsetLeft + (slide.offsetWidth / 2);
                    const distance = Math.abs(center - slideCenter);
                    if (distance < minDistance) {
                        minDistance = distance;
                        closestIndex = index;
                    }
                });
                return closestIndex;
            };

            reviewPrevBtn.addEventListener('click', () => {
                const currentIndex = getCiurrentIndex();
                if (currentIndex > 0) scrollToSlide(currentIndex - 1);
            });

            reviewNextBtn.addEventListener('click', () => {
                const currentIndex = getCiurrentIndex();
                if (currentIndex < reviewSlides.length - 1) scrollToSlide(currentIndex + 1);
            });
        }

        const updateActiveReview = () => {
            const center = reviewTrack.scrollLeft + (reviewTrack.offsetWidth / 2);
            let closestIndex = 0;
            let minDistance = Infinity;

            reviewSlides.forEach((slide, index) => {
                const slideCenter = slide.offsetLeft + (slide.offsetWidth / 2);
                const distance = Math.abs(center - slideCenter);
                
                if (distance < minDistance) {
                    minDistance = distance;
                    closestIndex = index;
                }
            });

            if (reviewPrevBtn && reviewNextBtn) {
                reviewPrevBtn.style.display = closestIndex === 0 ? 'none' : '';
                reviewNextBtn.style.display = closestIndex === reviewSlides.length - 1 ? 'none' : '';
            }

            reviewSlides.forEach((slide, index) => {
                if (index === closestIndex) {
                    slide.classList.add('active');
                    if (indicators[index]) indicators[index].classList.add('active');
                } else {
                    slide.classList.remove('active');
                    if (indicators[index]) indicators[index].classList.remove('active');
                }
            });
        };

        reviewTrack.addEventListener('scroll', () => {
            window.requestAnimationFrame(updateActiveReview);
        });
        
        updateActiveReview();
    }
    
});

