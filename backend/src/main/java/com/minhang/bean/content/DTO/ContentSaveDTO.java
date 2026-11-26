package com.minhang.bean.content.dto;

import com.fasterxml.jackson.databind.node.ObjectNode;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

/** API input; server-owned identifiers and timestamps are never copied from clients. */
public record ContentSaveDTO(
        @NotBlank @Pattern(regexp = "[a-z0-9]+(?:-[a-z0-9]+)*") @Size(max = 150) String slug,
        @NotBlank @Size(max = 300) String title,
        boolean published,
        @NotNull ObjectNode data,
        @PositiveOrZero Long version) {
}
