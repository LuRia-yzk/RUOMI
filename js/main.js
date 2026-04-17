/**
 * 偌米 RuoMI 官网 - 现代化交互脚本
 * 使用原生ES6+ JavaScript,无jQuery依赖
 */

// ============================================
// 工具函数
// ============================================

/**
 * DOM就绪后执行
 */
const ready = (callback) => {
    if (document.readyState !== 'loading') {
        callback();
    } else {
        document.addEventListener('DOMContentLoaded', callback);
    }
};

/**
 * 防抖函数
 */
const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

/**
 * 节流函数
 */
const throttle = (func, limit) => {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
};

/**
 * 平滑滚动到元素
 */
const smoothScrollTo = (targetElement, offset = 80) => {
    const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - offset;
    window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
    });
};

// ============================================
// 图片优化工具类
// ============================================
class ImageOptimizer {
    constructor() {
        this.init();
    }

    init() {
        // 1. 为所有懒加载图片添加淡入效果
        this.setupLazyImages();
        
        // 2. 预加载关键图片
        this.preloadCriticalImages();
        
        // 3. Banner图片按需加载
        this.optimizeBannerImages();
    }

    setupLazyImages() {
        const lazyImages = document.querySelectorAll('img[loading="lazy"]');
        
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    
                    // 创建新图片对象预加载
                    const tempImg = new Image();
                    tempImg.onload = () => {
                        img.classList.add('loaded');
                    };
                    tempImg.src = img.src;
                    
                    observer.unobserve(img);
                }
            });
        }, {
            rootMargin: '50px 0px', // 提前50px开始加载
            threshold: 0.01
        });

        lazyImages.forEach(img => imageObserver.observe(img));
    }

    preloadCriticalImages() {
        // 预加载首屏关键图片
        const criticalImages = [
            'images/logo.png',
            'images/banner-01.jpg'
        ];

        criticalImages.forEach(src => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'image';
            link.href = src;
            document.head.appendChild(link);
        });
    }

    optimizeBannerImages() {
        // Banner轮播图片按需加载
        const bannerSlides = document.querySelectorAll('.hero-slide');
        
        if (bannerSlides.length === 0) return;

        // 只加载前两张Banner,其余延迟加载
        bannerSlides.forEach((slide, index) => {
            const bg = slide.querySelector('.hero-bg');
            if (!bg) return;

            const bgStyle = bg.style.backgroundImage;
            const match = bgStyle.match(/url\(['"]?([^'")]+)['"]?\)/);
            
            if (match && index > 1) {
                // 非首屏Banner,移除background-image,改为data属性
                bg.removeAttribute('style');
                bg.setAttribute('data-bg', match[1]);
                
                // 当Slide激活时再加载
                const observer = new MutationObserver((mutations) => {
                    mutations.forEach(mutation => {
                        if (mutation.target.classList.contains('swiper-slide-active')) {
                            const dataBg = bg.getAttribute('data-bg');
                            if (dataBg) {
                                bg.style.backgroundImage = `url('${dataBg}')`;
                                bg.removeAttribute('data-bg');
                                observer.disconnect();
                            }
                        }
                    });
                });
                
                observer.observe(slide, { attributes: true, attributeFilter: ['class'] });
            }
        });
    }
}

// ============================================
// 页面加载器
// ============================================
class PageLoader {
    constructor() {
        this.loader = document.getElementById('loader');
        this.init();
    }

    init() {
        // 等待关键资源加载
        window.addEventListener('load', () => {
            setTimeout(() => {
                this.hide();
            }, 500); // 缩短等待时间
        });

        // 最长等待2秒
        setTimeout(() => {
            this.hide();
        }, 2000);
    }

    hide() {
        this.loader.classList.add('hidden');
        document.body.style.overflow = 'visible';
        
        // 动画结束后移除DOM
        setTimeout(() => {
            this.loader.style.display = 'none';
        }, 500);
    }
}

// ============================================
// 导航栏
// ============================================
class Navbar {
    constructor() {
        this.navbar = document.getElementById('navbar');
        this.mobileMenuToggle = document.getElementById('mobileMenuToggle');
        this.mobileNav = document.getElementById('mobileNav');
        this.mobileNavOverlay = this.mobileNav?.querySelector('.mobile-nav-overlay');
        this.navItems = document.querySelectorAll('.nav-item');
        this.sections = document.querySelectorAll('section[id]');
        
        this.init();
    }

    init() {
        this.handleScroll();
        this.setupMobileMenu();
        this.setupSmoothScroll();
        this.setupActiveNavigation();
        
        // 监听滚动事件(带节流)
        window.addEventListener('scroll', throttle(() => this.handleScroll(), 100));
    }

    handleScroll() {
        const scrollTop = window.scrollY;
        
        if (scrollTop > 50) {
            this.navbar.classList.add('scrolled');
        } else {
            this.navbar.classList.remove('scrolled');
        }
    }

    setupMobileMenu() {
        if (!this.mobileMenuToggle || !this.mobileNav) return;

        // 打开菜单
        this.mobileMenuToggle.addEventListener('click', () => {
            this.mobileNav.classList.add('active');
            document.body.style.overflow = 'hidden';
        });

        // 关闭菜单(点击遮罩)
        this.mobileNavOverlay?.addEventListener('click', () => {
            this.closeMobileMenu();
        });

        // 关闭菜单(点击链接)
        const mobileLinks = this.mobileNav.querySelectorAll('.mobile-nav-list a');
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                this.closeMobileMenu();
            });
        });
    }

    closeMobileMenu() {
        this.mobileNav.classList.remove('active');
        document.body.style.overflow = 'visible';
    }

    setupSmoothScroll() {
        const anchorLinks = document.querySelectorAll('a[href^="#"]');
        
        anchorLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                
                if (href === '#' || href === 'javascript:void(0)') return;
                
                e.preventDefault();
                const targetId = href.substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    smoothScrollTo(targetElement);
                }
            });
        });
    }

    setupActiveNavigation() {
        const observerOptions = {
            root: null,
            rootMargin: '-100px 0px -70% 0px',
            threshold: 0
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.getAttribute('id');
                    this.updateActiveNavItem(id);
                }
            });
        }, observerOptions);

        this.sections.forEach(section => observer.observe(section));
    }

    updateActiveNavItem(activeId) {
        this.navItems.forEach(item => {
            item.classList.remove('active');
            const link = item.querySelector('a');
            if (link && link.getAttribute('data-section') === activeId) {
                item.classList.add('active');
            }
        });
    }
}

// ============================================
// Banner轮播
// ============================================
class HeroSlider {
    constructor() {
        this.swiperEl = document.querySelector('.hero-swiper');
        this.init();
    }

    init() {
        if (!this.swiperEl || typeof Swiper === 'undefined') return;

        new Swiper(this.swiperEl, {
            loop: true,
            autoplay: {
                delay: 5000,
                disableOnInteraction: false,
                pauseOnMouseEnter: true
            },
            pagination: {
                el: '.swiper-pagination',
                clickable: true,
            },
            speed: 800,
            effect: 'fade',
            fadeEffect: {
                crossFade: true
            },
            observer: true,
            observeParents: true
        });
    }
}

// ============================================
// 数字滚动动画
// ============================================
class CounterAnimation {
    constructor() {
        this.counters = document.querySelectorAll('.counter');
        this.init();
    }

    init() {
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.5
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateCounter(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        this.counters.forEach(counter => observer.observe(counter));
    }

    animateCounter(element) {
        const target = parseInt(element.getAttribute('data-target'));
        if (!target || target <= 0) return;

        const duration = 2000;
        const step = target / (duration / 16);
        let current = 0;

        const updateCounter = () => {
            current += step;
            
            if (current < target) {
                element.textContent = Math.floor(current);
                requestAnimationFrame(updateCounter);
            } else {
                element.textContent = target;
            }
        };

        requestAnimationFrame(updateCounter);
    }
}

// ============================================
// 滚动动画
// ============================================
class ScrollAnimation {
    constructor() {
        this.animatedElements = document.querySelectorAll('.product-card, .stat-card');
        this.init();
    }

    init() {
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        // 初始化样式并观察
        this.animatedElements.forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(el);
        });

        // 添加CSS类
        this.addAnimationStyles();
    }

    addAnimationStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .animate-in {
                opacity: 1 !important;
                transform: translateY(0) !important;
            }
        `;
        document.head.appendChild(style);
    }
}

// ============================================
// 图片灯箱(Lightbox)
// ============================================
class Lightbox {
    constructor() {
        this.lightbox = document.getElementById('lightbox');
        this.lightboxImage = document.getElementById('lightboxImage');
        this.lightboxCaption = document.getElementById('lightboxCaption');
        this.closeBtn = this.lightbox?.querySelector('.lightbox-close');
        this.prevBtn = this.lightbox?.querySelector('.lightbox-prev');
        this.nextBtn = this.lightbox?.querySelector('.lightbox-next');
        this.overlay = this.lightbox?.querySelector('.lightbox-overlay');
        
        this.images = [];
        this.currentIndex = 0;
        
        // 缩放相关
        this.scale = 1;
        this.minScale = 0.5;
        this.maxScale = 3;
        this.scaleStep = 0.2;
        this.translateX = 0;
        this.translateY = 0;
        
        // 双指手势相关
        this.initialDistance = 0;
        this.initialScale = 1;
        this.isPinching = false;
        
        this.init();
    }

    init() {
        if (!this.lightbox) return;

        // 收集所有可点击的图片
        this.collectImages();
        
        // 绑定事件
        this.bindEvents();
        
        // 键盘支持
        this.setupKeyboard();
        
        // 滚轮缩放
        this.setupWheelZoom();
        
        // 双指手势缩放(移动端)
        this.setupPinchZoom();
        
        // 拖拽平移
        this.setupDragPan();
    }

    collectImages() {
        const triggers = document.querySelectorAll('.lightbox-trigger');
        
        triggers.forEach(trigger => {
            const img = trigger.querySelector('img');
            if (img) {
                this.images.push({
                    src: img.src,
                    alt: img.alt || '产品图片'
                });
            }
        });
    }

    bindEvents() {
        // 点击图片打开
        const triggers = document.querySelectorAll('.lightbox-trigger');
        triggers.forEach((trigger, index) => {
            trigger.addEventListener('click', (e) => {
                e.preventDefault();
                this.open(index);
            });
        });

        // 关闭按钮
        this.closeBtn?.addEventListener('click', () => this.close());
        
        // 点击遮罩关闭
        this.overlay?.addEventListener('click', () => this.close());
        
        // 上一张/下一张
        this.prevBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.prev();
        });
        
        this.nextBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.next();
        });

        // 阻止图片容器内点击冒泡
        this.lightboxImage?.addEventListener('click', (e) => {
            e.stopPropagation();
        });
        
        // 双击重置缩放
        this.lightboxImage?.addEventListener('dblclick', (e) => {
            e.stopPropagation();
            this.resetZoom();
        });
    }

    setupKeyboard() {
        document.addEventListener('keydown', (e) => {
            if (!this.lightbox.classList.contains('active')) return;

            switch(e.key) {
                case 'Escape':
                    this.close();
                    break;
                case 'ArrowLeft':
                    this.prev();
                    break;
                case 'ArrowRight':
                    this.next();
                    break;
                case '+':
                case '=':
                    e.preventDefault();
                    this.zoomIn();
                    break;
                case '-':
                    e.preventDefault();
                    this.zoomOut();
                    break;
                case '0':
                    e.preventDefault();
                    this.resetZoom();
                    break;
            }
        });
    }

    setupWheelZoom() {
        this.lightboxImage?.addEventListener('wheel', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            if (e.deltaY < 0) {
                // 向上滚动 - 放大
                this.zoomIn();
            } else {
                // 向下滚动 - 缩小
                this.zoomOut();
            }
        }, { passive: false });
    }

    setupPinchZoom() {
        if (!this.lightboxImage) return;

        // 触摸开始
        this.lightboxImage.addEventListener('touchstart', (e) => {
            if (e.touches.length === 2) {
                e.preventDefault();
                this.isPinching = true;
                
                // 计算初始双指距离
                this.initialDistance = this.getTouchDistance(e.touches[0], e.touches[1]);
                this.initialScale = this.scale;
            }
        }, { passive: false });

        // 触摸移动
        this.lightboxImage.addEventListener('touchmove', (e) => {
            if (this.isPinching && e.touches.length === 2) {
                e.preventDefault();
                
                const currentDistance = this.getTouchDistance(e.touches[0], e.touches[1]);
                const scaleRatio = currentDistance / this.initialDistance;
                
                let newScale = this.initialScale * scaleRatio;
                newScale = Math.max(this.minScale, Math.min(this.maxScale, newScale));
                
                this.setScale(newScale);
            }
        }, { passive: false });

        // 触摸结束
        this.lightboxImage.addEventListener('touchend', (e) => {
            if (e.touches.length < 2) {
                this.isPinching = false;
            }
        });
    }

    setupDragPan() {
        if (!this.lightboxImage) return;

        let isDragging = false;
        let startX = 0;
        let startY = 0;

        // 鼠标按下
        this.lightboxImage.addEventListener('mousedown', (e) => {
            if (this.scale > 1) {
                isDragging = true;
                startX = e.clientX - this.translateX;
                startY = e.clientY - this.translateY;
                this.lightboxImage.style.cursor = 'grabbing';
                e.preventDefault();
            }
        });

        // 鼠标移动
        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            
            this.translateX = e.clientX - startX;
            this.translateY = e.clientY - startY;
            
            this.updateTransform();
        });

        // 鼠标释放
        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                this.lightboxImage.style.cursor = 'grab';
            }
        });

        // 触摸拖拽(移动端)
        let touchStartX = 0;
        let touchStartY = 0;

        this.lightboxImage.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1 && this.scale > 1) {
                touchStartX = e.touches[0].clientX - this.translateX;
                touchStartY = e.touches[0].clientY - this.translateY;
            }
        }, { passive: true });

        this.lightboxImage.addEventListener('touchmove', (e) => {
            if (e.touches.length === 1 && this.scale > 1) {
                this.translateX = e.touches[0].clientX - touchStartX;
                this.translateY = e.touches[0].clientY - touchStartY;
                
                this.updateTransform();
            }
        }, { passive: true });
    }

    getTouchDistance(touch1, touch2) {
        const dx = touch1.clientX - touch2.clientX;
        const dy = touch1.clientY - touch2.clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }

    zoomIn() {
        const newScale = Math.min(this.maxScale, this.scale + this.scaleStep);
        this.setScale(newScale);
    }

    zoomOut() {
        const newScale = Math.max(this.minScale, this.scale - this.scaleStep);
        this.setScale(newScale);
    }

    setScale(newScale) {
        this.scale = newScale;
        
        // 如果缩小到1以下,重置位置
        if (this.scale <= 1) {
            this.translateX = 0;
            this.translateY = 0;
        }
        
        this.updateTransform();
    }

    updateTransform() {
        this.lightboxImage.style.transform = `translate(${this.translateX}px, ${this.translateY}px) scale(${this.scale})`;
    }

    resetZoom() {
        this.scale = 1;
        this.translateX = 0;
        this.translateY = 0;
        this.updateTransform();
    }

    open(index) {
        this.currentIndex = index;
        this.resetZoom(); // 打开时重置缩放
        this.updateImage();
        this.lightbox.classList.add('active');
        document.body.style.overflow = 'hidden'; // 禁止背景滚动
        
        // 设置光标样式
        this.lightboxImage.style.cursor = 'grab';
    }

    close() {
        this.resetZoom(); // 关闭时重置缩放
        this.lightbox.classList.remove('active');
        document.body.style.overflow = 'visible'; // 恢复滚动
    }

    prev() {
        this.resetZoom(); // 切换图片时重置缩放
        this.currentIndex = (this.currentIndex - 1 + this.images.length) % this.images.length;
        this.updateImage();
    }

    next() {
        this.resetZoom(); // 切换图片时重置缩放
        this.currentIndex = (this.currentIndex + 1) % this.images.length;
        this.updateImage();
    }

    updateImage() {
        const image = this.images[this.currentIndex];
        
        // 淡出效果
        this.lightboxImage.style.opacity = '0';
        
        setTimeout(() => {
            this.lightboxImage.src = image.src;
            this.lightboxImage.alt = image.alt;
            this.lightboxCaption.textContent = `${image.alt} (${this.currentIndex + 1}/${this.images.length}) | 滚轮缩放 | 双击重置`;
            
            // 淡入效果
            this.lightboxImage.onload = () => {
                this.lightboxImage.style.opacity = '1';
            };
        }, 200);
    }
}

// ============================================
// 主应用
// ============================================
class App {
    constructor() {
        this.init();
    }

    init() {
        // 禁止滚动直到加载完成
        document.body.style.overflow = 'hidden';

        // 初始化图片优化(最先执行)
        new ImageOptimizer();
        
        // 初始化所有模块
        new PageLoader();
        new Navbar();
        new HeroSlider();
        new CounterAnimation();
        new ScrollAnimation();
        new Lightbox(); // 添加Lightbox

        console.log('🚀 偌米RuoMI官网已加载完成');
        console.log('🖼️ 图片优化已启用');
        console.log('🔍 Lightbox图片放大已启用');
    }
}

// 启动应用
ready(() => {
    new App();
});
