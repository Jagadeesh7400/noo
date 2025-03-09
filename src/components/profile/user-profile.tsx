"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { User, MapPin, Briefcase, LinkIcon, Camera, Save, X, Plus } from "lucide-react"
import axios from "axios"
import { toast } from "react-hot-toast"

interface UserProfile {
  _id: string
  name: string
  email: string
  occupation: string
  location: string
  socialLinks: string[]
  profilePhoto: string
}

export default function UserProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [formData, setFormData] = useState({
    name: "",
    occupation: "",
    location: "",
    socialLinks: [""],
    profilePhoto: "",
  })

  useEffect(() => {
    fetchUserProfile()
  }, [])

  const fetchUserProfile = async () => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem("token")
      const user = JSON.parse(localStorage.getItem("user") || "{}")

      if (!token || !user.id) {
        toast.error("You must be logged in")
        return
      }

      const response = await axios.get(`http://localhost:5000/api/user/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      setProfile(response.data)
      setFormData({
        name: response.data.name || "",
        occupation: response.data.occupation || "",
        location: response.data.location || "",
        socialLinks: response.data.socialLinks?.length ? response.data.socialLinks : [""],
        profilePhoto: response.data.profilePhoto || "",
      })
    } catch (error) {
      console.error("Error fetching profile:", error)
      toast.error("Failed to load profile")

      // For demo purposes, set sample profile
      const sampleProfile = {
        _id: "user1",
        name: "John Doe",
        email: "john@example.com",
        occupation: "Web Developer",
        location: "New York, USA",
        socialLinks: ["https://github.com/johndoe", "https://linkedin.com/in/johndoe"],
        profilePhoto: "",
      }

      setProfile(sampleProfile)
      setFormData({
        name: sampleProfile.name,
        occupation: sampleProfile.occupation,
        location: sampleProfile.location,
        socialLinks: sampleProfile.socialLinks,
        profilePhoto: sampleProfile.profilePhoto,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleSocialLinkChange = (index: number, value: string) => {
    const updatedLinks = [...formData.socialLinks]
    updatedLinks[index] = value
    setFormData({ ...formData, socialLinks: updatedLinks })
  }

  const addSocialLink = () => {
    setFormData({ ...formData, socialLinks: [...formData.socialLinks, ""] })
  }

  const removeSocialLink = (index: number) => {
    const updatedLinks = formData.socialLinks.filter((_, i) => i !== index)
    setFormData({ ...formData, socialLinks: updatedLinks })
  }

  const handleProfilePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target) {
          setFormData({ ...formData, profilePhoto: event.target.result as string })
        }
      }
      reader.readAsDataURL(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const token = localStorage.getItem("token")
      const user = JSON.parse(localStorage.getItem("user") || "{}")

      if (!token || !user.id) {
        toast.error("You must be logged in")
        return
      }

      await axios.put(`http://localhost:5000/api/user/${user.id}`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      })

      // Update local storage with new user data
      localStorage.setItem(
        "user",
        JSON.stringify({
          ...user,
          name: formData.name,
          occupation: formData.occupation,
        }),
      )

      setProfile({
        ...profile!,
        ...formData,
      })

      setIsEditing(false)
      toast.success("Profile updated successfully")
    } catch (error) {
      console.error("Error updating profile:", error)
      toast.error("Failed to update profile")
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading && !profile) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="glass-card overflow-hidden">
        <div className="bg-gradient-to-r from-primary-dark to-secondary h-32"></div>

        <div className="px-6 pb-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-end -mt-16 mb-6">
            <div className="relative">
              <div className="w-32 h-32 rounded-full border-4 border-white/20 overflow-hidden bg-primary-medium">
                {formData.profilePhoto ? (
                  <img
                    src={formData.profilePhoto || "/placeholder.svg"}
                    alt={profile?.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-primary-light text-white">
                    <User size={64} />
                  </div>
                )}
              </div>

              {isEditing && (
                <label className="absolute bottom-0 right-0 bg-secondary text-white p-2 rounded-full cursor-pointer">
                  <Camera size={18} />
                  <input type="file" className="hidden" accept="image/*" onChange={handleProfilePhotoChange} />
                </label>
              )}
            </div>

            <div className="mt-4 sm:mt-0 sm:ml-6 text-center sm:text-left">
              {!isEditing ? (
                <>
                  <h1 className="text-2xl font-bold text-white">{profile?.name}</h1>
                  <p className="text-accent-light">{profile?.email}</p>
                </>
              ) : (
                <div className="mb-4">
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-accent"
                    placeholder="Your name"
                  />
                </div>
              )}
            </div>

            <div className="ml-auto mt-4 sm:mt-0">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 rounded-lg border border-white/20 text-white hover:bg-white/10 transition-colors"
                >
                  Edit Profile
                </button>
              ) : (
                <div className="flex space-x-3">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 rounded-lg border border-white/20 text-white hover:bg-white/10 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="px-4 py-2 rounded-lg bg-secondary hover:bg-secondary-light text-white transition-colors flex items-center gap-2"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                      <>
                        <Save size={18} />
                        <span>Save</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-white/10 pt-6">
            {!isEditing ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center space-x-3">
                  <Briefcase className="text-accent" size={20} />
                  <div>
                    <h3 className="text-sm font-medium text-accent-light">Occupation</h3>
                    <p className="text-white">{profile?.occupation || "Not specified"}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <MapPin className="text-accent" size={20} />
                  <div>
                    <h3 className="text-sm font-medium text-accent-light">Location</h3>
                    <p className="text-white">{profile?.location || "Not specified"}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 md:col-span-2">
                  <LinkIcon className="text-accent mt-1" size={20} />
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-accent-light">Social Links</h3>
                    {profile?.socialLinks?.length ? (
                      <ul className="space-y-1 mt-1">
                        {profile.socialLinks.map((link, index) => (
                          <li key={index}>
                            <a
                              href={link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-accent hover:text-accent-light break-all"
                            >
                              {link}
                            </a>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-white">No social links added</p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-accent-light">Occupation</label>
                  <div className="flex items-center">
                    <Briefcase className="text-white/50 mr-2" size={18} />
                    <input
                      type="text"
                      name="occupation"
                      value={formData.occupation}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-accent"
                      placeholder="Your occupation"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-accent-light">Location</label>
                  <div className="flex items-center">
                    <MapPin className="text-white/50 mr-2" size={18} />
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-accent"
                      placeholder="Your location"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-accent-light">Social Links</label>
                  {formData.socialLinks.map((link, index) => (
                    <div key={index} className="flex items-center mb-2">
                      <LinkIcon className="text-white/50 mr-2" size={18} />
                      <input
                        type="url"
                        value={link}
                        onChange={(e) => handleSocialLinkChange(index, e.target.value)}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-accent"
                        placeholder="https://example.com"
                      />
                      <button
                        type="button"
                        onClick={() => removeSocialLink(index)}
                        className="ml-2 p-1 text-red-400 hover:bg-red-500/20 rounded-full"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addSocialLink}
                    className="mt-2 text-accent hover:text-accent-light text-sm flex items-center"
                  >
                    <Plus size={16} className="mr-1" />
                    Add another link
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

