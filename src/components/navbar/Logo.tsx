
import { useNavigate } from 'react-router-dom';

export const Logo = () => {
  const navigate = useNavigate();
  
  return (
    <div className="flex-shrink-0 flex items-center">
      <span 
        className="text-xl font-semibold cursor-pointer" 
        onClick={() => navigate('/')}
      >
        Membify
      </span>
    </div>
  );
};
