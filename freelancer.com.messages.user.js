// ==UserScript==
// @name         freelancer.com messages
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  freelancer.com
// @author       Sazzad Hossain (Tushar) Khan <itsazzad@gmail.com>
// @match        https://www.freelancer.com/messages/*
// @icon         https://www.google.com/s2/favicons?domain=freelancer.com
// @grant        none
// @require      https://code.jquery.com/jquery-3.6.0.min.js
// ==/UserScript==

(function ($) {
    'use strict';

    addCSS();

    $(document).on('click', 'app-messaging-thread-list fl-user-avatar', function () {
        const messageList = document.getElementsByClassName('MessageList');
        const messageItems = messageList[0].getElementsByTagName('app-messaging-message-item');

        for (let messageItem of messageItems) {
            const messageHeaderText = messageItem.querySelector('[class^="Message-headerText"]');
            if (messageHeaderText) {
                console.log(0, messageHeaderText.textContent)
            }
            const message = messageItem.getElementsByClassName('Message');
            if (message.length) {
                console.log(1, message[0].textContent)
            }
        }
    });

    function addCSS() {
        const style = `<style>
    </style>`;

        $(style).appendTo('body');
    }

})($);
