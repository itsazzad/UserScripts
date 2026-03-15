// ==UserScript==
// @name         freelancer.com projects
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  freelancer.com
// @author       Sazzad Hossain (Tushar) Khan <itsazzad@gmail.com>
// @match        https://www.freelancer.com/projects/*
// @icon         https://www.google.com/s2/favicons?domain=freelancer.com
// @grant        none
// @require      https://code.jquery.com/jquery-3.6.0.min.js
// ==/UserScript==

(function ($) {
    'use strict';

    const BASE_URL = `https://www.freelancer.com/api`;
    let ProjectSeoUrl;
    let ProjectID;
    let Project;
    let OwnerID;
    let Owner;

    addCSS();
    initEnhancements();

    $(document).on('click', "app-project-title", async function () {
        await renderBidStats();
    });

    $(document).on('click', 'app-employer-info', async function () {
        await renderEmployerInfo();
    });

    function initEnhancements(retries = 12) {
        renderBidStats();
        renderEmployerInfo();

        if (retries > 0 && (!$('#user-script-bid-stats-badge').length || !$('.user-script-employer-info-list-item').length)) {
            setTimeout(function () {
                initEnhancements(retries - 1);
            }, 800);
        }
    }

    async function renderBidStats() {
        if (!Project) {
            Project = await getProject();
        }

        const project = Project && Project.result && Project.result.projects && Project.result.projects[0];
        const bidStats = project && project.bid_stats;

        if (!bidStats) {
            return;
        }

        showBidStats(bidStats.bid_count, bidStats.bid_avg);
    }

    async function renderEmployerInfo() {
        if (!Project) {
            Project = await getProject();
        }

        const project = Project && Project.result && Project.result.projects && Project.result.projects[0];
        if (!project) {
            return;
        }

        if (!OwnerID) {
            OwnerID = project.owner_id;
        }

        if (!OwnerID) {
            return;
        }

        if (!Owner) {
            Owner = await getOwner(OwnerID);
        }

        if (!Owner || !Owner.result || !Owner.result.users || !Owner.result.users[OwnerID]) {
            return;
        }

        updateEmployerInfo(Owner.result.users[OwnerID]);
    }

    function showBidStats(count, avg) {
        if (!$("#user-script-bid-stats-badge").length) {
            const proposalTabButtons$ = $("app-project-view-tabs .TabList fl-tab-item:contains('Proposals') button.TabItem");
            const targetButton$ = proposalTabButtons$.filter(':visible').first().length
                ? proposalTabButtons$.filter(':visible').first()
                : proposalTabButtons$.first();

            if (targetButton$.length) {
                targetButton$.append(bidStatsBadge(count, avg));
            }
        }
    }

    function updateEmployerInfo(employer) {
        if (!$('.user-script-employer-info-list-item').length) {
            let appEmployerInfoList$ = $('app-employer-info .CardBody h3:contains("About the Client")').first().closest('.CardBody').find('> fl-list').first();
            if (!appEmployerInfoList$.length) {
                appEmployerInfoList$ = $('app-employer-info .CardBody fl-list-item:eq(0) fl-list').first();
            }

            if (!appEmployerInfoList$.length) {
                return;
            }

            employer.username && appEmployerInfoList$.append(employerInfoListItem("Username", employer.username));
            employer.display_name && appEmployerInfoList$.append(employerInfoListItem("Display Name", employer.display_name));
            employer.public_name && appEmployerInfoList$.append(employerInfoListItem("Public Name", employer.public_name));
            employer.company && appEmployerInfoList$.append(employerInfoListItem("Company", employer.company));
        }
    }

    async function doAjax(url) {
        let result;

        try {
            result = await $.ajax({
                url,
            });

            console.log("Ajax", result);

            return result;
        } catch (error) {
            console.error(error);
        }
    }

    async function getOwner(userID) {
        const url = `${BASE_URL}/users/0.1/users?users[]=${userID}`;

        return await doAjax(url);
    }

    async function getProject() {
        if (!ProjectSeoUrl)
            ProjectSeoUrl = window.location.pathname.replace(/^\/projects\//, "").replace(/\/details$/, "");

        let url;
        if (ProjectSeoUrl) {
            url = `${BASE_URL}/projects/0.1/projects?seo_urls[]=${ProjectSeoUrl}`;
        } else {
            if (!ProjectID)
                ProjectID = $('.ProjectViewDetailsId').text().trim().match(/\d+/g)[0];
            url = `${BASE_URL}/projects/0.1/projects?projects[]=${ProjectID}`;
        }

        return await doAjax(url);
    }

    function employerInfoListItem(key, value) {
        return `<fl-list-item role="listitem" title="${key}" class="user-script-employer-info-list-item">
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

    function bidStatsBadge(count, avg) {
        return `<fl-bit class="IconContainer" id="user-script-bid-stats-badge">
        <fl-text class="UnreadCount">
            <span class="NativeElement">${count}/${Math.ceil(avg)}</span>
        </fl-text>
    </fl-bit>`;
    }

    function addCSS() {
        const style = `<style>
        .user-script-employer-info-list-item {
            font-size: 14px;
            line-height: 1.43;
            color: #0e1724;
            font-weight: 400;
            font-style: normal;
            display: inline;
        }

        #user-script-bid-stats-badge .UnreadCount{
            align-items: center;
            background: #eb3730;
            border-radius: 50%;
            display: flex;
            justify-content: center;
        }
    </style>`;

        $(style).appendTo('body');
    }

})($);
