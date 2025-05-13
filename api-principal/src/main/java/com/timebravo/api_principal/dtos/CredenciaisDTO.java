package com.timebravo.api_principal.dtos;

import jakarta.validation.constraints.NotBlank;

public class CredenciaisDTO {
    
    @NotBlank
    private String username;
    
    @NotBlank
    private String password;

    public CredenciaisDTO() {}

    public CredenciaisDTO(String username, String password) {
        this.username = username;
        this.password = password;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }    
}
