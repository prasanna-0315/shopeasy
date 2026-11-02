package com.backend.shopeasy.repository;

import com.backend.shopeasy.model.ShopOrder;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<ShopOrder, Long> {
    List<ShopOrder> findAllByUser_IdOrderByCreatedAtDesc(Long userId);

    Optional<ShopOrder> findByIdAndUser_Id(Long id, Long userId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select purchase from ShopOrder purchase where purchase.id = :id and purchase.user.id = :userId")
    Optional<ShopOrder> findForUpdateByIdAndUserId(@Param("id") Long id, @Param("userId") Long userId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select purchase from ShopOrder purchase where purchase.id = :id")
    Optional<ShopOrder> findForUpdateById(@Param("id") Long id);

    List<ShopOrder> findAllByOrderByCreatedAtDesc();
}
