package com.stayease.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

/**
 * Request body for cancelling a booking.
 * The booking reference comes from the URL path; the email is provided
 * in the body as a second authentication factor.
 */
public record CancelBookingRequest(

        @NotBlank(message = "Email is required to cancel a booking")
        @Email(message = "Please provide a valid email address")
        String email

) {}

