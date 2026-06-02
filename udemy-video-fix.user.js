// ==UserScript==
// @name         Udemy Ultimate Video Controls Fix
// @namespace    https://github.com/Equiel-1703
// @version      2.0.0
// @description  Class-agnostic fix for stuck Udemy video controls. Anchors to the HTML5 video tag.
// @author       Henrique Rodrigues Barraz (Fixed by Gemini)
// @license      GPL-3.0
// @match        https://www.udemy.com/course/*
// @icon         https://www.udemy.com/staticx/udemy/images/v7/apple-touch-icon.png
// @run-at       document-end
// @grant        none
// ==/UserScript==

(function() {
    "use strict";

    // Inject CSS rules that do not rely on any specific class names
    const style = document.createElement("style");
    style.textContent = `
        /* Hide everything inside the video wrapper except the video itself when idle */
        [data-user-video-idle="true"] > :not(video) {
            opacity: 0 !important;
            pointer-events: none !important;
            transition: opacity 0.4s ease-in-out !important;
        }

        /* ABSOLUTE EXCEPTION: Keep captions visible if they match common naming patterns */
        [data-user-video-idle="true"] > [class*="caption" i],
        [data-user-video-idle="true"] > [class*="subtitle" i],
        [data-user-video-idle="true"] > .shaka-text-container {
            opacity: 1 !important;
            pointer-events: auto !important;
        }

        /* Hide the mouse cursor over the player when idle */
        [data-user-video-idle="true"] {
            cursor: none !important;
        }
    `;
    document.head.appendChild(style);

    // Apply interaction behavior to the player container
    function setupVideoFix(videoElement) {
        const container = videoElement.parentElement;
        if (!container) return;

        let idleTimer = null;
        const hideDelayMS = 3000; // Time in ms before controls hide

        const hideUI = () => {
            container.setAttribute("data-user-video-idle", "true");
        };

        const showUI = () => {
            container.removeAttribute("data-user-video-idle");
            clearTimeout(idleTimer);
            idleTimer = setTimeout(hideUI, hideDelayMS);
        };

        // Event listeners to handle mouse states
        container.addEventListener("mousemove", showUI);
        container.addEventListener("mouseenter", showUI);
        container.addEventListener("mouseleave", hideUI);

        // Initial activation
        showUI();
        console.log("UdemyVideoFix> Successfully anchored to video container:", container);
    }

    // Single-Page Apps destroy and recreate video nodes.
    // This polling loop ensures we attach cleanly whenever a new video loads.
    setInterval(() => {
        const video = document.querySelector("video");
        if (video && !video.dataset.controlsFixed) {
            video.dataset.controlsFixed = "true";
            setupVideoFix(video);
        }
    }, 1000);

})();
