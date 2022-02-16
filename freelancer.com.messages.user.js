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

const ProjectsByDateTime = {};

const Months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

(function ($) {
    'use strict';

    addCSS();

    $(document).on('click', 'app-messaging-thread-list fl-user-avatar', function () {
        console.log(0, ProjectsByDateTime)
        const d = new Date();
        const day = d.getDate();
        const month = Months[d.getMonth()];
        const year = d.getFullYear();
        const messageList = document.getElementsByClassName('MessageList');
        const messageItems = messageList[0].getElementsByTagName('app-messaging-message-item');
        let date = "";
        let time = "";
        for (let messageItem of messageItems) {
            const messageHeaderText = messageItem.querySelector('[class^="Message-headerText"]');
            if (messageHeaderText) {//Date
                date = messageHeaderText.textContent.trim();
                if (date == "Today") {
                    date = `${month} ${day}, ${year}`;
                }
                if (!ProjectsByDateTime[date]) {
                    ProjectsByDateTime[date] = {};
                }

            }
            const appMessagingMessageDetails = messageItem.getElementsByTagName('app-messaging-message-details');
            if (appMessagingMessageDetails.length) {//Time
                time = appMessagingMessageDetails[0].textContent.trim();
                if (!ProjectsByDateTime[date][time])
                    ProjectsByDateTime[date][time] = []
            }

            const messageBubbleText = messageItem.getElementsByClassName('Message-bubble-text');
            if (messageBubbleText.length) {//Details
                let details = messageBubbleText[0].textContent.trim();
                ProjectsByDateTime[date][time].push(details);
            }

        }
        console.log(1, ProjectsByDateTime);
    });

    function addCSS() {
        const style = `<style>
    </style>`;

        $(style).appendTo('body');
    }

})($);
