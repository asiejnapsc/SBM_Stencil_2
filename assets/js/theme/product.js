/*
 Import all product specific js
 */
import PageManager from './page-manager';
import Review from './product/reviews';
import collapsibleFactory from './common/collapsible';
import ProductDetails from './common/product-details';
import videoGallery from './product/video-gallery';
import { classifyForm } from './common/form-utils';

export default class Product extends PageManager {
    constructor(context) {
        super(context);
        this.url = window.location.href;
        this.$reviewLink = $('[data-reveal-id="modal-review-form"]');
        this.$bulkPricingLink = $('[data-reveal-id="modal-bulk-pricing"]');
    }

    onReady() {
        // Listen for foundation modal close events to sanitize URL after review.
        $(document).on('close.fndtn.reveal', () => {
            if (this.url.indexOf('#write_review') !== -1 && typeof window.history.replaceState === 'function') {
                window.history.replaceState(null, document.title, window.location.pathname);
            }
        });

        let validator;

        // Init collapsible
        collapsibleFactory();

        this.productDetails = new ProductDetails($('.productView'), this.context, window.BCData.product_attributes);
        this.productDetails.setProductVariant();

        videoGallery();

        const $reviewForm = classifyForm('.writeReview-form');
        const review = new Review($reviewForm);

        $('body').on('click', '[data-reveal-id="modal-review-form"]', () => {
            validator = review.registerValidation(this.context);
        });

        $reviewForm.on('submit', () => {
            if (validator) {
                validator.performCheck();
                return validator.areAll('valid');
            }

            return false;
        });

        this.productReviewHandler();
        this.bulkPricingHandler();

        this.getCustomFields();
    }

    productReviewHandler() {
        if (this.url.indexOf('#write_review') !== -1) {
            this.$reviewLink.trigger('click');
        }
    }

    bulkPricingHandler() {
        if (this.url.indexOf('#bulk_pricing') !== -1) {
            this.$bulkPricingLink.trigger('click');
        }
    }

    /* eslint-disable */

    /* -- PSC Custom Field Code ---
    * 01. Grab parent element that houses all custom fields
    * 02. If custom fields exist
    * 03. Convert to array to parse
    * 04. Discern between each type of custom field
    * 05. All related functionality pertaining to adding a blog post to the product UI
    * 06. All related functionality pertaining to adding a video post to the product UI
    */
    getCustomFields() {
        const customFieldsParentElement = document.getElementById('ProductCustomFields'); // 01
        const customFields = customFieldsParentElement.children;
        if (customFields[0]) { // 02
            const customFieldArray = Array.from(customFields); // 03

            const blogArray = [];
            const videoArray = [];
            // Loop through each custom field
            customFieldArray.forEach(function (element, index) {
                const customFieldLabel = element.children[0].innerHTML.trim();
                const customFieldValue = element.children[1].innerHTML.trim();

                switch (customFieldLabel) { // 04

                    case 'Blog': // 05
                        console.log('This product has a Blog.');

                        let currentBlogURL = customFieldValue;
                        let currentBlogTitle = element.nextElementSibling.children[1].innerHTML.trim();
                        
                        // create an array to keep the blog and blog title together
                        blogArray.push({
                          blogTitle: currentBlogTitle,
                          blogURL: currentBlogURL
                        });

                        let blogArea = document.querySelector('#tab-articles');
                        let blogTabLink = document.querySelector('.blogTabLink');
                        let blogHTML = '';
                        
                        // build out all the html for each blog post (icon + title/url)
                        // iterate through each blog object and construct the html surrounding it
                        blogArray.forEach(function (blogObject) {

                            // format for insertion
                            blogHTML += `
                            <div class="article_div">
                                <a class="p_article" target="_blank" href="${blogObject.blogURL}">
            
                                    <i class="far fa-file-alt fa-4x"></i>

                                    <div class="blog-text-container">
                                        <div>${blogObject.blogTitle}</div>
                                    </div>
                                </a>
                            </div>
                            `;
                        });

                        blogArea.innerHTML = blogHTML;
                        blogTabLink.style.display = 'block';

                        break;

                    case 'Video': // 06
                        let currentVideoURL = customFieldValue;
                        let videoID = currentVideoURL.substring(currentVideoURL.lastIndexOf('/') + 1);

                        videoArray.push({
                            videoURL: currentVideoURL,
                            videoID: videoID
                        });

                        let videoArea = document.querySelector('#tab-videos');
                        let videoTabLink = document.querySelector('.videoTabLink');
                        let videoHTML = '';

                        videoArray.forEach(function (videoObject) {
                            videoHTML += `
                            <div class="yt-thumb-container">
                                <a href="${videoObject.videoURL}" data-lity="">

                                    <img src="https://i3.ytimg.com/vi/${videoObject.videoID}/hqdefault.jpg" alt="product video" />

                                    <span class="yt-thumb-button">.</span>

                                </a>
                            </div>
                            `;
                        });

                        videoArea.innerHTML = videoHTML;
                        videoTabLink.style.display = 'block';

                        break;

                    default:
                        break;
                }

            });

        }

    }
    /* eslint-enable */
}
