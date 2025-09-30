'use client';

import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";

export default function CreatorHero() {
  const { data: session, status } = useSession();
  const isCreator = session?.user?.isCreator;
  const isLoading = status === "loading";
  
  return (    
    <section className="py-12 bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 lg:pt-32 pb-8 sm:pb-12 lg:pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 xl:gap-12 items-center">
                   
          <div className="lg:col-span-4 space-y-4 sm:space-y-6 order-1 lg:order-1">
            <div className="space-y-3 sm:space-y-4">
              <p className="text-red-500 text-2xl sm:text-3xl lg:text-3xl xl:text-4xl font-bold uppercase tracking-wide leading-tight">
                EMM-FORT CREATOR PROGRAM
              </p>
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 leading-tight">
                Earn 5% Commission Creating Content You Already Love
              </h1>
              <p className="text-gray-600 text-base sm:text-lg leading-relaxed">
                Get paid when people shop groceries through your content. Create fun, authentic grocery hauls,
                unboxings, and lifestyle posts.
              </p>
            </div>
           
            <div className="h-12 flex items-center">
              {!isLoading && (
                <>
                  {isCreator ? (
                    <Link href="/creator/dashboard">
                      <button className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold py-2.5 sm:py-3 px-4 sm:px-6 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 text-sm sm:text-base">
                        Go to Dashboard
                      </button>
                    </Link>
                  ) : (
                    <Link href="/creator/auth/login">
                      <button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold py-2.5 sm:py-3 px-4 sm:px-6 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 text-sm sm:text-base">
                        Start Earning Today
                      </button>
                    </Link>
                  )}
                </>
              )}

              {isLoading && (
                <button disabled className="bg-gray-400 text-white font-semibold py-2.5 sm:py-3 px-4 sm:px-6 rounded-full text-sm sm:text-base">
                  Loading...
                </button>
              )}
            </div>
          </div>
         
          <div className="lg:col-span-4 order-2 lg:order-2 flex justify-center items-center">
            <div className="relative w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl aspect-square">

              <div className="absolute inset-4 sm:inset-8 lg:inset-12 bg-gradient-to-br from-orange-400 via-pink-400 to-red-500 rounded-full animate-pulse opacity-60"></div>
              <div
                className="absolute inset-2 sm:inset-6 lg:inset-10 bg-gradient-to-br from-orange-400 via-pink-400 to-red-500 rounded-full opacity-80"
                style={{
                  animation: "float 6s ease-in-out infinite",
                }}
              ></div>

              <div className="relative w-full h-full z-10">
                <Image
                  src="/creator/img-4.png"
                  alt="Content creator with finger to lips"
                  fill
                  priority
                  className="object-contain transition-transform duration-300 hover:scale-105"
                  sizes="(max-width: 640px) 320px, (max-width: 768px) 384px, (max-width: 1024px) 448px, 512px"
                  unoptimized
                />
              </div>
            </div>
          </div>
         
          <div className="lg:col-span-4 order-2 lg:order-3">
            <div className="space-y-4 sm:space-y-6">
                           
              <div className="bg-white rounded-lg shadow-lg p-3 sm:p-4 flex items-center space-x-3 transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
                <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.872.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">YouTube</p>
                  <p className="text-xs text-gray-600 truncate">
                    Subscribe for grocery hauls, unboxings, and shopping tips.
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-base sm:text-lg font-bold text-gray-900">1.5M+</p>
                  <p className="text-xs text-gray-600 pb-1">Subscribers</p>
                  <button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-medium py-1 px-3 sm:px-4 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 text-xs sm:text-sm">
                    Subscribe
                  </button>
                </div>
              </div>
             
              <div className="bg-white rounded-lg shadow-lg p-3 sm:p-4 flex items-center space-x-3 transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
                <div className="w-8 h-8 bg-black rounded flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">TikTok</p>
                  <p className="text-xs text-gray-600 truncate">Follow for quick grocery tips and shopping hauls.</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-base sm:text-lg font-bold text-gray-900">800K+</p>
                  <p className="text-xs text-gray-600">Followers</p>
                  <button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-medium py-1 px-3 sm:px-4 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 text-xs sm:text-sm">
                    Follow
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>   
    </section>

  );
} 