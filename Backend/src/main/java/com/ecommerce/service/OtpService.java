package com.ecommerce.service;

import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class OtpService {

    private final JavaMailSender mailSender;
    private final Map<String, String> otpStorage = new ConcurrentHashMap<>();

    public void generateAndSendOtp(String email) {
        String otp = String.format("%06d", new Random().nextInt(999999));
        otpStorage.put(email, otp);

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(email);
            message.setSubject("Password Reset OTP");
            message.setText("Your OTP for password reset is: " + otp);
            mailSender.send(message);
        } catch (Exception e) {
            // Log to console so user can test without real SMTP configuration
            System.out.println("=========================================");
            System.out.println("FAILED TO SEND EMAIL (Check SMTP config)");
            System.out.println("OTP FOR " + email + " IS: " + otp);
            System.out.println("=========================================");
        }
    }

    public boolean validateOtp(String email, String otp) {
        String storedOtp = otpStorage.get(email);
        if (storedOtp != null && storedOtp.equals(otp)) {
            otpStorage.remove(email); // OTP is one-time use
            return true;
        }
        return false;
    }
}
