package com.carvo.api.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

import com.carvo.api.dto.checkrecord.CheckRecordResponse;
import com.carvo.api.entity.CheckRecord;
import com.carvo.api.entity.User;
import com.carvo.api.entity.enums.CheckType;
import com.carvo.api.service.CheckRecordService;
import java.lang.reflect.Field;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class AdminControllerCheckRecordTest {

    @Mock
    private CheckRecordService checkRecordService;

    private AdminController adminController;

    @BeforeEach
    void setUp() {
        adminController = new AdminController(null, null, checkRecordService);
    }

    @Test
    void auditLog_returnsAllCheckRecords() {
        User staff = new User();
        setId(staff, 1L);
        staff.setName("John");

        CheckRecord record1 = new CheckRecord();
        setId(record1, 10L);
        setRecordedAt(record1, Instant.now());
        record1.setStaff(staff);
        record1.setType(CheckType.CHECK_OUT);
        record1.setOdometerReading(45000);
        record1.setConditionNotes("Vehicle OK");
        record1.setExtraCharges(BigDecimal.ZERO);

        CheckRecord record2 = new CheckRecord();
        setId(record2, 11L);
        setRecordedAt(record2, Instant.now());
        record2.setStaff(staff);
        record2.setType(CheckType.CHECK_IN);
        record2.setOdometerReading(45150);
        record2.setConditionNotes("Small dent on door");
        record2.setExtraCharges(new BigDecimal("50.00"));

        List<CheckRecordResponse> responses = List.of(
                CheckRecordResponse.from(record1),
                CheckRecordResponse.from(record2));

        when(checkRecordService.findAll()).thenReturn(responses);

        List<CheckRecordResponse> result = adminController.auditLog();

        assertThat(result).hasSize(2);
        assertThat(result.get(0).id()).isEqualTo(10L);
        assertThat(result.get(0).type()).isEqualTo("CHECK_OUT");
        assertThat(result.get(0).staffName()).isEqualTo("John");
        assertThat(result.get(1).id()).isEqualTo(11L);
        assertThat(result.get(1).extraCharges()).isEqualByComparingTo(new BigDecimal("50.00"));
    }

    @Test
    void auditLog_returnsEmptyListWhenNoRecords() {
        when(checkRecordService.findAll()).thenReturn(List.of());

        List<CheckRecordResponse> result = adminController.auditLog();

        assertThat(result).isEmpty();
    }

    private void setId(Object target, Long id) {
        try {
            Field field = target.getClass().getDeclaredField("id");
            field.setAccessible(true);
            field.set(target, id);
        } catch (ReflectiveOperationException ex) {
            throw new AssertionError("Unable to set id for test fixture", ex);
        }
    }

    private void setRecordedAt(CheckRecord target, Instant recordedAt) {
        try {
            Field field = CheckRecord.class.getDeclaredField("recordedAt");
            field.setAccessible(true);
            field.set(target, recordedAt);
        } catch (ReflectiveOperationException ex) {
            throw new AssertionError("Unable to set recordedAt for test fixture", ex);
        }
    }
}
