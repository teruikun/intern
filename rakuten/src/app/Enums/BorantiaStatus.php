<?php
namespace App\Enums;

enum BorantiaStatus: string
{
    case Recruiting = 'recruiting';
    case Closed = 'closed';
    case Cancelled = 'cancelled';
}
