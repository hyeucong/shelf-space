<?php

namespace App\Policies;

use App\Models\Kit;
use App\Models\User;

class KitPolicy
{
    public function view(User $user, Kit $kit): bool
    {
        return $user->id === $kit->user_id;
    }

    public function update(User $user, Kit $kit): bool
    {
        return $user->id === $kit->user_id;
    }

    public function delete(User $user, Kit $kit): bool
    {
        return $user->id === $kit->user_id;
    }
}
