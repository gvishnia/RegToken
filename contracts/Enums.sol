pragma solidity ^0.8.17;
// Enum order representing order  status
enum OrderStatus {
    New,
    PartialFill,
    Filled,
    Rejected,
    Canceled,
    NULL
 }