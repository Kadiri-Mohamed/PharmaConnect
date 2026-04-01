<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use App\Models\Pharmacy;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Tymon\JWTAuth\Contracts\JWTSubject;

class User extends Authenticatable implements JWTSubject
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * Get the identifier that will be stored in the subject claim of the JWT.
     *
     * @return mixed
     */
    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    /**
     * Return a key value array, containing any custom claims to be added to the JWT.
     *
     * @return array
     */
    public function getJWTCustomClaims()
    {
        return [];
    }

    /**
     * Get the pharmacy owned by the user.
     */
    public function pharmacy()
    {
        return $this->hasOne(Pharmacy::class);
    }

    /**
     * Get the user's panier (shopping cart).
     */
    public function panier()
    {
        return $this->hasOne(Panier::class);
    }

    /**
     * Get all paniers for the user.
     */
    public function paniers()
    {
        return $this->hasMany(Panier::class);
    }

    /**
     * Get all commandes (orders) placed by the user.
     */
    public function commandes()
    {
        return $this->hasMany(Commande::class);
    }

    /**
     * Get all ordonnances (prescriptions) uploaded by the user.
     */
    public function ordonnances()
    {
        return $this->hasMany(Ordonnance::class);
    }

    /**
     * Get all rare medicine requests made by the user.
     */
    public function rareMedicineRequests()
    {
        return $this->hasMany(RareMedicineRequest::class);
    }
}

