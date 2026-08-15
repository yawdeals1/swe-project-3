package com.carvo.api.dto.admin;

import com.carvo.api.entity.Branch;

public record BranchResponse(Long id, String name, String address, String phone) {

    public static BranchResponse from(Branch branch) {
        return new BranchResponse(branch.getId(), branch.getName(), branch.getAddress(), branch.getPhone());
    }
}
