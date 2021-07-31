// ==UserScript==
// @name         freelancer.com
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  freelancer.com
// @author       Sazzad Hossain (Tushar) Khan <itsazzad@gmail.com>
// @match        https://www.freelancer.com/projects/*/*/details
// @icon         https://www.google.com/s2/favicons?domain=freelancer.com
// @grant        none
// @require      https://code.jquery.com/jquery-3.6.0.min.js
// ==/UserScript==

(function ($) {
    'use strict';

    function fl_list_item(key, value) {
        return `<fl-list-item role="listitem" title="${key}">
        <fl-bit class="BitsListItem">
            <fl-bit class="BitsListItemContainer">
                <fl-bit class="BitsListItemHeader">
                    <fl-bit class="BitsListItemContent">
                        <fl-text>
                            <div role="paragraph" class="NativeElement">${value}</div>
                        </fl-text>
                    </fl-bit>
                </fl-bit>
            </fl-bit>
        </fl-bit>
    </fl-list-item>`;
    }
    $(document).on('click', 'app-employer-info .CardHeader', function () {
        const BASE_URL = `https://www.freelancer.com/api`;
        const projectID = $('.ProjectViewDetailsId').text().trim().match(/\d+/g)[0];
        const seoURL = window.location.pathname.replace(/^\/projects\//, "").replace(/\/details$/, "");

        let projectGetURL;
        if (projectID) {
            projectGetURL = `${BASE_URL}/projects/0.1/projects?projects[]=${projectID}`;
        } else {
            projectGetURL = `${BASE_URL}/projects/0.1/projects?seo_urls[]=${seoURL}`;
        }
        $.ajax(projectGetURL)
            .done(function (data, textStatus, jqXHR) {
                console.log(data);
                const userID = data.result.projects[0].owner_id;
                $.ajax(`${BASE_URL}/users/0.1/users?users[]=${userID}`)
                    .done(function (data, textStatus, jqXHR) {
                        console.log(data);
                        const userData = data.result.users[userID];
                        const appEmployerInfoList$ = $('app-employer-info .CardBody fl-list-item:eq(0) fl-list');
                        appEmployerInfoList$.append(fl_list_item("Username", userData.username));
                        appEmployerInfoList$.append(fl_list_item("Display Name", userData.display_name));
                        appEmployerInfoList$.append(fl_list_item("Public Name", userData.public_name));
                        appEmployerInfoList$.append(fl_list_item("Company", userData.company));
                    })
                    .fail(function (jqXHR, textStatus, errorThrown) {
                        console.error("Request failed: " + textStatus);
                    });

            })
            .fail(function (jqXHR, textStatus, errorThrown) {
                console.error("Request failed: " + textStatus);
            });

    });

})($);