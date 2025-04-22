interface TrainingNotFoundProps {
  type: 'overview' | 'profile' | 'audience' | 'curriculum' | 'module' | 'evaluation' | 'students' | 'sessions'
}

const messages = {
  overview: {
    title: 'Training Overview Not Found',
    description: 'We couldn\'t find the overview for this training.'
  },
  profile: {
    title: 'Training Profile Not Found',
    description: 'We couldn\'t find the profile details for this training.'
  },
  audience: {
    title: 'Audience Profile Not Found',
    description: 'We couldn\'t find the audience profile for this training.'
  },
  curriculum: {
    title: 'Curriculum Not Found',
    description: 'We couldn\'t find the curriculum for this training.'
  },
  module: {
    title: 'Module Not Found',
    description: 'We couldn\'t find any modules for this training.'
  },
  evaluation: {
    title: 'Evaluation Not Found',
    description: 'We couldn\'t find the evaluation for this training.'
  },
  students: {
    title: 'Students Not Found',
    description: 'We couldn\'t find any students for this training.'
  },
  sessions: {
    title: 'Sessions Not Found',
    description: 'We couldn\'t find any sessions for this training.'
  }
}

export function TrainingNotFound({ type }: TrainingNotFoundProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      <div className="w-10 h-10 mb-8">
        {/* <img 
          src="/not-found.svg" 
          alt="Not Found" 
          className="w-full h-full object-contain"
        /> */}
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        {messages[type].title}
      </h3>
      <p className="text-gray-500 text-center max-w-md">
        {messages[type].description}
        <br />
        This might be because the content has been deleted or you don&apos;t have permission to view it.
      </p>
    </div>
  )
} 