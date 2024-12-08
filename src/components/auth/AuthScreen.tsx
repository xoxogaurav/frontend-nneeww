import React, { useState, useEffect } from 'react';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';
import { Users, Award, TrendingUp, Star } from 'lucide-react';
import { generateDemoReward, type DemoReward } from '../../utils/demoRewards';

interface AuthScreenProps {
  initialMode?: 'login' | 'signup';
}

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Freelancer",
    content: "TaskFlow has revolutionized how I manage my freelance work. The rewards are amazing!",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
  },
  {
    name: "Michael Chen",
    role: "Digital Marketer",
    content: "The platform is intuitive and the earning potential is fantastic. Highly recommended!",
    avatar: "https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
  },
  {
    name: "Emma Wilson",
    role: "Content Creator",
    content: "I love how easy it is to find and complete tasks. The rewards are always on time!",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
  }
];

export default function AuthScreen({ initialMode = 'login' }: AuthScreenProps) {
  const [isLogin, setIsLogin] = useState(initialMode === 'login');
  const [usersOnline, setUsersOnline] = useState(0);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [recentRewards, setRecentRewards] = useState<DemoReward[]>([]);

  // Initialize rewards
  useEffect(() => {
    const initialRewards = Array.from({ length: 3 }, () => generateDemoReward());
    setRecentRewards(initialRewards);
  }, []);

  // Simulate changing online users count
  useEffect(() => {
    const baseUsers = 150;
    const updateUsers = () => {
      const variation = Math.floor(Math.random() * 20) - 10;
      setUsersOnline(baseUsers + variation);
    };
    updateUsers();
    const interval = setInterval(updateUsers, 5000);
    return () => clearInterval(interval);
  }, []);

  // Add new rewards periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const newReward = generateDemoReward();
      setRecentRewards(prev => [newReward, ...prev.slice(0, 2)]);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-indigo-50 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-[10px] opacity-50">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>
      </div>

      <div className="relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Login/Signup Form */}
            <div className="flex flex-col justify-center">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 sm:p-12 max-w-md mx-auto w-full">
                {isLogin ? (
                  <LoginForm onToggleForm={() => setIsLogin(false)} />
                ) : (
                  <SignupForm onToggleForm={() => setIsLogin(true)} />
                )}
              </div>
            </div>

            {/* Right side - Features and Stats */}
            <div className="space-y-12 lg:pl-12">
              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 text-center">
                  <Users className="h-8 w-8 text-indigo-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">{usersOnline}</div>
                  <div className="text-sm text-gray-600">Users Online</div>
                </div>
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 text-center">
                  <Award className="h-8 w-8 text-indigo-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">$50K+</div>
                  <div className="text-sm text-gray-600">Rewards Paid</div>
                </div>
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 text-center sm:col-span-1 col-span-2">
                  <TrendingUp className="h-8 w-8 text-indigo-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">10K+</div>
                  <div className="text-sm text-gray-600">Tasks Completed</div>
                </div>
              </div>

              {/* Live Rewards Feed */}
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Live Rewards Feed</h3>
                <div className="space-y-4">
                  {recentRewards.map((reward) => (
                    <div key={reward.id} className="flex items-center justify-between animate-slide-in">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                          <Star className="h-4 w-4 text-indigo-600" />
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">{reward.name}</p>
                          <p className="text-xs text-gray-500">{reward.task}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-semibold text-green-600">+${reward.amount.toFixed(2)}</span>
                        <p className="text-xs text-gray-500">
                          {new Date(reward.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Testimonials */}
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6">
                <div className="relative h-48">
                  {testimonials.map((testimonial, index) => (
                    <div
                      key={index}
                      className={`absolute inset-0 transition-opacity duration-500 ${
                        index === currentTestimonial ? 'opacity-100' : 'opacity-0'
                      }`}
                    >
                      <div className="flex items-center mb-4">
                        <img
                          src={testimonial.avatar}
                          alt={testimonial.name}
                          className="w-12 h-12 rounded-full"
                        />
                        <div className="ml-4">
                          <div className="font-medium text-gray-900">{testimonial.name}</div>
                          <div className="text-sm text-gray-500">{testimonial.role}</div>
                        </div>
                      </div>
                      <p className="text-gray-600 italic">{testimonial.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}