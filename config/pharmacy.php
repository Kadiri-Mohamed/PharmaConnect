<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Pharmacy Configuration
    |--------------------------------------------------------------------------
    |
    | Business rules and constraints for the pharmacy system
    |
    */

    'orders' => [
        'max_quantity' => 9999,
        'default_status' => 'pending',
        'allowed_statuses' => ['pending', 'preparing', 'ready', 'delivered', 'cancelled'],
    ],

    'cart' => [
        'max_items' => 50,
        'session_duration_hours' => 24,
    ],

    'stock' => [
        'low_stock_threshold' => 5,
        'enable_backorder' => false,
        'enable_overselling' => false,
    ],

    'prescriptions' => [
        'require_validation' => true,
        'validation_duration_months' => 6,
        'allowed_statuses' => ['pending', 'validated', 'rejected'],
    ],

    'rare_requests' => [
        'allowed_statuses' => ['pending', 'found', 'not_found'],
        'notification_email' => env('PHARMACY_NOTIFICATION_EMAIL'),
    ],

    'payment' => [
        'currency' => 'USD',
        'decimal_places' => 2,
    ],

    'performance' => [
        'use_query_caching' => true,
        'cache_duration_minutes' => 30,
        'use_lazy_loading' => false,
    ],

    'logging' => [
        'log_stock_changes' => true,
        'log_order_events' => true,
        'log_failed_orders' => true,
    ],
];
