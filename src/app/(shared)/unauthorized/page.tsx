import Image from 'next/image';

export default function Unauthorized() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center max-w-xl mx-auto p-5">
      <div className="relative w-full aspect-square">
        <Image 
          src="/unauthorized.svg" 
          alt="Unauthorized"
          fill
          className="object-contain"
        />
      </div>
      <p className="text-xl text-center font-normal">You are not authorized to access this page.</p>
    </div>
  );
}
