/* global $ */
$(document).ready(function() {
    'use strict';

    $.ajax({
        method: 'GET',
        url: window.location.pathname + '/getAllUsers'
    }).then(function(users) {
        console.log(users);
        users.forEach(function(user) {
            appendUser(user);
        });
    });

    $('#users-info').on('click', '.btn-delete', function(event) {
        event.stopPropagation();
        event.stopImmediatePropagation();
        var addr = $(this).attr('href');
        $("#userModal").modal('show');
        $("#modal-id").attr('data-url', addr);
    });

    $("#modal-id").on('click', function() {
        deleteUser($(this).attr('data-url'));
    });

    function appendUser(user) {

        var roleText = '';
        var userPic = '';
        var deleteButton = '';
        var updateButton = '<div class="p-3">';

        if (user.role == 'steward') {
            roleText = '<div>סדרן</div>';
            userPic = '<div class="rounded-circle cover-image-lg" style="background-image: url(' + user.userPic.url + '); border: 2px solid var(--azure);">&nbsp;</div>';
            if ($('#users-info').attr('curr-user') == user._id) {
                updateButton = '<a class="btn btn-default btn-round btn-sm mr-2 pl-3 pr-3" href="' + window.location.pathname + '/' + user._id + '/edit">עדכון</a>';
            }
        }
        else {
            roleText = '<div>נהג</div>';
            userPic = '<div class="rounded-circle cover-image-lg" style="background-image: url(' + user.userPic.url + '); border: 2px solid var(--pinkish);">&nbsp;</div>';
            deleteButton = '<div href="' + window.location.pathname + '/' + user._id + '" class="btn btn-delete btn-round btn-sm pl-3 pr-3"> מחיקה  <i class="fal fa-trash-alt ml-2"></i></div>';
            updateButton = '<a class="btn btn-default btn-round btn-sm mr-2 pl-3 pr-3" href="' + window.location.pathname + '/' + user._id + '/edit">עדכון</a>';
        }

        var vendorTemplate = $('' +
            '<div id="general_' + user._id + '" class="col-12 col-sm-10 col-md-6 col-lg-6 col-xl-6">' +
            '<div class="card">' +
            '<div class="card-info">' +
            '<div class="media d-flex">' +
            '<div class="media-body text-left">' +
            '<h3>' +
            user.firstName + ' ' + user.lastName +
            '</h3>' +
            '<small>' +
            'מספר ת.ז.:' +
            user.username +
            '</small>' +
            '<div class="mt-2 input-phone">' +
            '<a href="tel:' + user.phoneNumber.replace(/\s/g, '') + '">' + user.phoneNumber + '</a>' +
            '</div>' +
            roleText +
            '</div>' +
            '<div class="align-self-center">' +
            userPic +
            '</div>' +
            '</div>' +
            '<div class="mt-4 centered-buttons-container">' +
            updateButton +
            deleteButton +
            '</div>' +
            '</div>' +
            '</div>' +
            '</div>'
        );

        $('#users-info').append(vendorTemplate);
    }

    $("form").submit(function(e) {
        e.preventDefault();
        var creationURL = $(this).attr('action');
        var userData = {
            username: $("#username").val(),
            firstName: $("#firstName").val(),
            lastName: $("#lastName").val(),
            address: $("#userAddress").val(),
            phoneNumber: $("#phoneNumber").val(),
            role: $("#role").val()
        }

        console.log(userData);

        $.post(creationURL, userData)
            .then(function(newUser) {
                console.log(newUser);
                $('#open-form-dialog').trigger('click');
                $("#username").val('');
                $("#firstName").val('');
                $("#lastName").val('');
                $("#userAddress").val('');
                $("#phoneNumber").val('');

                appendUser(newUser);
            });
    });

    // Delete car route
    function deleteUser(userURL) {
        var id = userURL.split('/');
        id = id[id.length - 1];

        console.log(userURL, id);
        $.ajax({
            method: 'DELETE',
            url: userURL
        }).then(function(response) {
            console.log(response);
            $('#general_' + id).hide('slow', function() { $('#general_' + id).remove(); });
        });
    }
});
