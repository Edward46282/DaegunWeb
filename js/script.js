document.addEventListener('DOMContentLoaded', () => {
    const cursor = document.querySelector('.custom-cursor');
    const supportsHover = window.matchMedia("(hover: hover)").matches;

    // 커서 로직: PC에서만 커서 효과 적용, 모바일에서는 숨김
    if (supportsHover && cursor) {
        let mouseX = 0, mouseY = 0, cursorX = 0, cursorY = 0;
        let isActive = false;

        document.addEventListener('pointermove', (e) => {
            if (e.pointerType === 'touch') {
                cursor.style.opacity = 0;
                isActive = false;
                return; 
            }

            mouseX = e.clientX;
            mouseY = e.clientY;
            if (!isActive) {
                cursor.style.opacity = 1;
                isActive = true;
            }
        });

        function animateCursor() {
            const dx = mouseX - cursorX;
            const dy = mouseY - cursorY;
            // lerp 계산: 현재 위치 + (목표 위치 - 현재 위치) * 속도
            if (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1) {
                cursorX += dx * 0.5;
                cursorY += dy * 0.5;
                cursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0) translate(-50%, -50%)`;
            }
            requestAnimationFrame(animateCursor);
        }
        requestAnimationFrame(animateCursor);

        document.addEventListener('mouseover', (e) => {
            const target = e.target.closest('.interactive, a, button');
            if (target) {
                cursor.style.width = '60px';
                cursor.style.height = '60px';
                cursor.style.backgroundColor = 'rgba(255, 77, 0, 0.1)';
                cursor.style.borderColor = 'rgba(255, 77, 0, 0.8)';
            } else {
                cursor.style.width = '40px';
                cursor.style.height = '40px';
                cursor.style.backgroundColor = 'transparent';
                cursor.style.borderColor = 'var(--primary)';
            }
        });
    } else if (cursor) {
        cursor.style.display = 'none';
    }

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

    let lastActiveIndex = -1;
    let galleryTicking = false;

    if (gallerySection && galleryItems.length > 0) {
        const updateGallery = (activeIndex) => {
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
        };

        window.addEventListener('scroll', () => {
            if (!galleryTicking) {
                window.requestAnimationFrame(() => {
                    const rect = gallerySection.getBoundingClientRect();
                    const windowHeight = window.innerHeight;
                    const sectionHeight = gallerySection.offsetHeight;
                    const scrolled = -rect.top;

                    // 아직 섹션에 진입하지 않은 경우
                    if (scrolled <= 0) {
                        if (lastActiveIndex !== 0) {
                            updateGallery(0);
                            lastActiveIndex = 0;
                        }
                    } 
                    // 섹션을 완전히 스크롤한 경우
                    else if (scrolled >= (sectionHeight - windowHeight)) {
                        const lastIdx = galleryItems.length - 1;
                        if (lastActiveIndex !== lastIdx) {
                            updateGallery(lastIdx);
                            lastActiveIndex = lastIdx;
                        }
                    } 
                    // 섹션과 아직 상호작용중
                    else {
                        // 임계점 계산
                        const totalScrollableDistance = sectionHeight - windowHeight;
                        const stepSize = totalScrollableDistance / galleryItems.length;
                        let activeIndex = Math.floor(scrolled / stepSize);
                        
                        activeIndex = Math.max(0, Math.min(galleryItems.length - 1, activeIndex));

                        if (activeIndex !== lastActiveIndex) {
                            updateGallery(activeIndex);
                            lastActiveIndex = activeIndex;
                        }
                    }

                    galleryTicking = false;
                });
                galleryTicking = true;
            }
        }, { passive: true });
    }

    // 네비게이션 버튼으로 work class 캐러셀 스크롤

    const carousel = document.querySelector('.work-carousel');
    const nextBtn = document.querySelector('.next-btn');
    const prevBtn = document.querySelector('.prev-btn');

    const scrollAmount = 400; 

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
                    // 할인율을 극대화하기 위해 올림 방식의 할인율 공식을 사용
                    const discountPercentage = Math.ceil(((originalPrice - discountPrice) / originalPrice) * 100);
                    badgeEl.innerText = `${discountPercentage}% OFF`;
                }
            }
        });
    }

    calculateDiscounts();

    // 서비스 2 스크롤 섹션

    const horizontalSection = document.querySelector('.horizontal-scroll-section');
    const horizontalTrack = document.querySelector('.horizontal-track');

    if (horizontalSection && horizontalTrack) {
        let isTicking = false;
        let sectionTop = 0;
        let maxScroll = 0;
        let resizeTimeout;
        let isMobile = window.innerWidth <= 900;

        function updateScrollMetrics() {
            isMobile = window.innerWidth <= 900;
            
            if (isMobile) {
                horizontalTrack.style.transform = 'none';
                return;
            }
            
            sectionTop = horizontalSection.offsetTop;
            const stickyContainer = horizontalSection.querySelector('.sticky-container');
            const stickyHeight = stickyContainer ? stickyContainer.offsetHeight : window.innerHeight;
            maxScroll = horizontalSection.offsetHeight - stickyHeight;
        }

        updateScrollMetrics();

        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(updateScrollMetrics, 150);
        });

        window.addEventListener('scroll', () => {
            if (isMobile) return; 

            if (!isTicking) {
                window.requestAnimationFrame(() => {
                    const currentScroll = window.scrollY;
                    const scrollProgress = currentScroll - sectionTop;

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

