package com.carvo.api.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "vehicle_image")
public class VehicleImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "vehicle_id", nullable = false)
    private Vehicle vehicle;

    /** Where the photo actually lives: an absolute, publicly readable Deploro R2 URL that the
     *  browser fetches directly. Set at upload time for new photos and backfilled for every
     *  pre-existing row in V5, so this — not {@link #imageData} — is the read path. */
    @Column(name = "image_url")
    private String imageUrl;

    @Column(name = "content_type")
    private String contentType;

    /** Pre-migration image bytes, retained only as the rollback path for the move to R2 — nothing
     *  writes to this any more, and a follow-up migration drops it once every image is confirmed
     *  rendering from {@link #imageUrl}. Reclaiming its ~22MB needs a VACUUM FULL. */
    @Column(name = "image_data")
    private byte[] imageData;

    public Long getId() {
        return id;
    }

    public Vehicle getVehicle() {
        return vehicle;
    }

    public void setVehicle(Vehicle vehicle) {
        this.vehicle = vehicle;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public String getContentType() {
        return contentType;
    }

    public void setContentType(String contentType) {
        this.contentType = contentType;
    }

    public byte[] getImageData() {
        return imageData;
    }

    public void setImageData(byte[] imageData) {
        this.imageData = imageData;
    }
}
