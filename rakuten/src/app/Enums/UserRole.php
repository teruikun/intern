<?php
namespace App\Enums;

enum UserRole: string
{
    case User = 'user';
    case Organization = 'organization';
}
