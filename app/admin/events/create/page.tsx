"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { eventService } from "@/services/event.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface ExtendedEventFormData {
  event_name: string;
  description: string;
  venue_name: string;
  venue_address: string;
  venue_city: string;
  venue_state: string;
  venue_country: string;
  venue_postal_code: string;
  venue_latitude: string;
  venue_longitude: string;
  event_logo?: File | null;
  event_banner?: File | null;
  status: string;
  start_at: string;
  end_at: string;
  is_featured: boolean;
  sort_order: string;
  custom_fields?: string;
  metadata?: string;
  slug?: string;
}

export default function CreateEventPage() {
  const router = useRouter();
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const iconColor = "text-gray-600 dark:text-gray-400";
  const valueColor = "text-blue-400 dark:text-blue-300";

  const [formData, setFormData] = useState<ExtendedEventFormData>({
    event_name: "",
    description: "",
    venue_name: "",
    venue_address: "",
    venue_city: "",
    venue_state: "",
    venue_country: "",
    venue_postal_code: "",
    venue_latitude: "",
    venue_longitude: "",
    event_logo: null,
    event_banner: null,
    status: "draft",
    start_at: "",
    end_at: "",
    is_featured: false,
    sort_order: "1",
    custom_fields: "",
    metadata: "",
    slug: "",
  });

  useEffect(() => {
    if (!token) {
      router.push("/admin-login");
    }
  }, [token]);

  // Auto-generate slug from event name
  useEffect(() => {
    if (formData.event_name) {
      const slug = formData.event_name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setFormData(prev => ({ ...prev, slug }));
    }
  }, [formData.event_name]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleFileChange = (name: string, file: File | null) => {
    setFormData(prev => ({
      ...prev,
      [name]: file,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Log form data for debugging
      console.log('Form data before submission:', formData);

      // Validate required fields on frontend
      if (!formData.event_name.trim()) {
        throw new Error('Event name is required');
      }
      if (!formData.description.trim()) {
        throw new Error('Description is required');
      }

      // Check if we have file uploads
      const hasFiles = formData.event_logo || formData.event_banner;

      let submitData;

      if (hasFiles) {
        // Use FormData for file uploads
        submitData = new FormData();
        
        // Add all non-file fields
        submitData.append('event_name', formData.event_name);
        submitData.append('description', formData.description);
        submitData.append('venue_name', formData.venue_name);
        submitData.append('venue_address', formData.venue_address);
        submitData.append('venue_city', formData.venue_city);
        submitData.append('venue_state', formData.venue_state);
        submitData.append('venue_country', formData.venue_country);
        submitData.append('venue_postal_code', formData.venue_postal_code);
        submitData.append('venue_latitude', formData.venue_latitude);
        submitData.append('venue_longitude', formData.venue_longitude);
        submitData.append('status', formData.status);
        submitData.append('start_at', formData.start_at);
        submitData.append('end_at', formData.end_at);
        submitData.append('is_featured', formData.is_featured.toString());
        submitData.append('sort_order', formData.sort_order);
        
        if (formData.slug) submitData.append('slug', formData.slug);
        if (formData.custom_fields) submitData.append('custom_fields', formData.custom_fields);
        if (formData.metadata) submitData.append('metadata', formData.metadata);

        // Add files
        if (formData.event_logo) {
          submitData.append('event_logo', formData.event_logo);
        }
        if (formData.event_banner) {
          submitData.append('event_banner', formData.event_banner);
        }
      } else {
        // Use JSON for regular data
        submitData = {
          event_name: formData.event_name,
          description: formData.description,
          venue_name: formData.venue_name,
          venue_address: formData.venue_address,
          venue_city: formData.venue_city,
          venue_state: formData.venue_state,
          venue_country: formData.venue_country,
          venue_postal_code: formData.venue_postal_code,
          venue_latitude: formData.venue_latitude,
          venue_longitude: formData.venue_longitude,
          status: formData.status,
          start_at: formData.start_at,
          end_at: formData.end_at,
          is_featured: formData.is_featured,
          sort_order: formData.sort_order,
          slug: formData.slug,
          custom_fields: formData.custom_fields || null,
          metadata: formData.metadata || null,
        };
      }

      console.log('Submit data:', submitData);

      await eventService.createEvent(submitData);
      router.push("/admin/events");
    } catch (err: any) {
      console.error('Submit error:', err);
      setError(err?.message || "Failed to create event");
    } finally {
      setLoading(false);
    }
  };

  if (!token) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <Card className="dark:bg-gray-800 rounded-2xl p-6 border border-gray-800 dark:border-gray-700 hover:border-gray-700 dark:hover:border-gray-600 transition-all duration-200 shadow-lg max-w-6xl mx-auto">
        <CardHeader>
          <div className="flex items-center space-x-4 mb-4">
            <Link href="/admin/events">
              <Button variant="ghost" size="sm" className={iconColor}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Events
              </Button>
            </Link>
            <div>
              <h1 className={`text-2xl font-bold ${valueColor}`}>Create New Event</h1>
              <p className={iconColor}>Fill in all the event details</p>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className={`text-lg font-semibold ${valueColor}`}>Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="event_name" className={iconColor}>Event Name *</Label>
                  <Input
                    id="event_name"
                    name="event_name"
                    value={formData.event_name}
                    onChange={handleInputChange}
                    required
                    className={valueColor}
                    placeholder="Enter event name"
                  />
                </div>

                <div>
                  <Label htmlFor="slug" className={iconColor}>Slug (Auto-generated)</Label>
                  <Input
                    id="slug"
                    name="slug"
                    value={formData.slug}
                    onChange={handleInputChange}
                    className={valueColor}
                    placeholder="event-slug"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="description" className={iconColor}>Description *</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows={4}
                    className={valueColor}
                    placeholder="Enter event description"
                  />
                </div>
              </div>
            </div>

            {/* Date and Time */}
            <div className="space-y-4">
              <h3 className={`text-lg font-semibold ${valueColor}`}>Date and Time</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="start_at" className={iconColor}>Start Date & Time *</Label>
                  <Input
                    id="start_at"
                    name="start_at"
                    type="datetime-local"
                    value={formData.start_at}
                    onChange={handleInputChange}
                    required
                    className={valueColor}
                  />
                </div>

                <div>
                  <Label htmlFor="end_at" className={iconColor}>End Date & Time *</Label>
                  <Input
                    id="end_at"
                    name="end_at"
                    type="datetime-local"
                    value={formData.end_at}
                    onChange={handleInputChange}
                    required
                    className={valueColor}
                  />
                </div>
              </div>
            </div>

            {/* Venue Information */}
            <div className="space-y-4">
              <h3 className={`text-lg font-semibold ${valueColor}`}>Venue Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="venue_name" className={iconColor}>Venue Name *</Label>
                  <Input
                    id="venue_name"
                    name="venue_name"
                    value={formData.venue_name}
                    onChange={handleInputChange}
                    required
                    className={valueColor}
                    placeholder="Enter venue name"
                  />
                </div>

                <div>
                  <Label htmlFor="venue_address" className={iconColor}>Venue Address *</Label>
                  <Input
                    id="venue_address"
                    name="venue_address"
                    value={formData.venue_address}
                    onChange={handleInputChange}
                    required
                    className={valueColor}
                    placeholder="Enter venue address"
                  />
                </div>

                <div>
                  <Label htmlFor="venue_city" className={iconColor}>City *</Label>
                  <Input
                    id="venue_city"
                    name="venue_city"
                    value={formData.venue_city}
                    onChange={handleInputChange}
                    required
                    className={valueColor}
                    placeholder="Enter city"
                  />
                </div>

                <div>
                  <Label htmlFor="venue_state" className={iconColor}>State *</Label>
                  <Input
                    id="venue_state"
                    name="venue_state"
                    value={formData.venue_state}
                    onChange={handleInputChange}
                    required
                    className={valueColor}
                    placeholder="Enter state"
                  />
                </div>

                <div>
                  <Label htmlFor="venue_country" className={iconColor}>Country *</Label>
                  <Input
                    id="venue_country"
                    name="venue_country"
                    value={formData.venue_country}
                    onChange={handleInputChange}
                    required
                    className={valueColor}
                    placeholder="Enter country"
                  />
                </div>

                <div>
                  <Label htmlFor="venue_postal_code" className={iconColor}>Postal Code *</Label>
                  <Input
                    id="venue_postal_code"
                    name="venue_postal_code"
                    value={formData.venue_postal_code}
                    onChange={handleInputChange}
                    required
                    className={valueColor}
                    placeholder="Enter postal code"
                  />
                </div>

                <div>
                  <Label htmlFor="venue_latitude" className={iconColor}>Latitude</Label>
                  <Input
                    id="venue_latitude"
                    name="venue_latitude"
                    value={formData.venue_latitude}
                    onChange={handleInputChange}
                    placeholder="12.0000"
                    className={valueColor}
                  />
                </div>

                <div>
                  <Label htmlFor="venue_longitude" className={iconColor}>Longitude</Label>
                  <Input
                    id="venue_longitude"
                    name="venue_longitude"
                    value={formData.venue_longitude}
                    onChange={handleInputChange}
                    placeholder="77.0000"
                    className={valueColor}
                  />
                </div>
              </div>
            </div>

            {/* Images */}
            <div className="space-y-4">
              <h3 className={`text-lg font-semibold ${valueColor}`}>Images</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="event_logo" className={iconColor}>Event Logo</Label>
                  <Input
                    id="event_logo"
                    name="event_logo"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange('event_logo', e.target.files?.[0] || null)}
                    className={valueColor}
                  />
                </div>

                <div>
                  <Label htmlFor="event_banner" className={iconColor}>Event Banner</Label>
                  <Input
                    id="event_banner"
                    name="event_banner"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange('event_banner', e.target.files?.[0] || null)}
                    className={valueColor}
                  />
                </div>
              </div>
            </div>

            {/* Settings */}
            <div className="space-y-4">
              <h3 className={`text-lg font-semibold ${valueColor}`}>Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <Label htmlFor="status" className={iconColor}>Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => handleSelectChange("status", value)}
                  >
                    <SelectTrigger>
                      <SelectValue className={valueColor} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="sort_order" className={iconColor}>Sort Order</Label>
                  <Input
                    id="sort_order"
                    name="sort_order"
                    type="number"
                    value={formData.sort_order}
                    onChange={handleInputChange}
                    className={valueColor}
                  />
                </div>

                <div className="flex items-center space-x-2 pt-6">
                  <Checkbox
                    id="is_featured"
                    checked={formData.is_featured}
                    onCheckedChange={(checked) => handleCheckboxChange("is_featured", checked as boolean)}
                  />
                  <Label htmlFor="is_featured" className={`cursor-pointer ${iconColor}`}>
                    Featured Event
                  </Label>
                </div>
              </div>
            </div>

            {/* Advanced Fields */}
            <div className="space-y-4">
              <h3 className={`text-lg font-semibold ${valueColor}`}>Advanced Fields (Optional)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="custom_fields" className={iconColor}>Custom Fields (JSON)</Label>
                  <Textarea
                    id="custom_fields"
                    name="custom_fields"
                    value={formData.custom_fields}
                    onChange={handleInputChange}
                    placeholder='{"field1": "value1", "field2": "value2"}'
                    rows={4}
                    className={valueColor}
                  />
                </div>

                <div>
                  <Label htmlFor="metadata" className={iconColor}>Metadata (JSON)</Label>
                  <Textarea
                    id="metadata"
                    name="metadata"
                    value={formData.metadata}
                    onChange={handleInputChange}
                    placeholder='{"key1": "value1", "key2": "value2"}'
                    rows={4}
                    className={valueColor}
                  />
                </div>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-4 pt-6">
              <Link href="/admin/events">
                {/* <Button type="button" variant="outline">
                  Cancel
                </Button> */}
              </Link>
              <Button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Event"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
