// components/vendors/VendorCreateForm.jsx
"use client";
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { vendorService } from '@/services/vendorService';
import { userService } from '@/services/userService';

export function VendorCreateForm({ onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await userService.getAll();
            console.log('Users', response);
      setUsers(response.data.users || []);
    } catch (error) {
      console.log('Falied To Load Users', error);
      toast.error('Failed to load users');
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await vendorService.create(data);
      toast.success('Vendor created successfully!');
      onSuccess?.();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to create vendor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Create New Vendor</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* User Selection */}
            <div className="space-y-4">
              <Label htmlFor="userId">Select User *</Label>
              <Select onValueChange={(value) => setValue('userId', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a user" />
                </SelectTrigger>
                <SelectContent>
                  {users.map(user => (
                    <SelectItem key={user._id} value={user._id}>
                      {user.firstName} {user.lastName} ({user.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.userId && (
                <p className="text-red-500 text-sm">{errors.userId.message}</p>
              )}
            </div>

            {/* Company Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name *</Label>
                <Input
                  {...register("companyName", {
                    required: "Company name is required",
                    minLength: {
                      value: 2,
                      message: "Company name must be at least 2 characters"
                    }
                  })}
                  placeholder="Enter company name"
                />
                {errors.companyName && (
                  <p className="text-red-500 text-sm">{errors.companyName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactPerson">Contact Person *</Label>
                <Input
                  {...register("contactPerson", {
                    required: "Contact person is required"
                  })}
                  placeholder="Contact person name"
                />
                {errors.contactPerson && (
                  <p className="text-red-500 text-sm">{errors.contactPerson.message}</p>
                )}
              </div>
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  {...register("phone", {
                    required: "Phone number is required",
                    pattern: {
                      value: /^[0-9+\-\s()]{10,}$/,
                      message: "Please enter a valid phone number"
                    }
                  })}
                  placeholder="Phone number"
                />
                {errors.phone && (
                  <p className="text-red-500 text-sm">{errors.phone.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="commissionRate">Commission Rate (%)</Label>
                <Input
                  type="number"
                  {...register("commissionRate", {
                    min: 0,
                    max: 100
                  })}
                  placeholder="10"
                  defaultValue={10}
                />
                {errors.commissionRate && (
                  <p className="text-red-500 text-sm">{errors.commissionRate.message}</p>
                )}
              </div>
            </div>

            {/* Address Information */}
            <div className="space-y-4">
              <Label>Address Information</Label>

              <div className="grid grid-cols-1 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="address.street">Street Address</Label>
                  <Input
                    {...register("address.street")}
                    placeholder="Street address"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="address.city">City</Label>
                    <Input
                      {...register("address.city")}
                      placeholder="City"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address.state">State</Label>
                    <Input
                      {...register("address.state")}
                      placeholder="State"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="address.zipCode">ZIP Code</Label>
                    <Input
                      {...register("address.zipCode")}
                      placeholder="ZIP Code"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address.country">Country</Label>
                    <Input
                      {...register("address.country")}
                      placeholder="Country"
                      defaultValue="Pakistan"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                {...register("notes")}
                placeholder="Any additional information about this vendor..."
                rows={3}
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onSuccess}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating...
                  </>
                ) : (
                  'Create Vendor'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}