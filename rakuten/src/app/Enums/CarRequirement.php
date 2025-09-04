<?php
namespace App\Enums;

enum CarRequirement: string
{
    case Must = 'must';
    case Preferred = 'preferred';
    case None = 'none';
}
