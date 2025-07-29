import React from 'react';
import { Coins, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';

interface PointReward {
  points: number;
  experience: number;
  reason: string;
}

export const showPointReward = (reward: PointReward) => {
  toast.custom(
    (t) => (
      <div
        className={`${
          t.visible ? 'animate-enter' : 'animate-leave'
        } max-w-md w-full bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5 border-l-4 border-green-500`}
      >
        <div className="flex-1 w-0 p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                <Coins className="h-5 w-5 text-white" />
              </div>
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                积分奖励！
              </p>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {reward.reason}
              </p>
              <div className="mt-2 flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <Coins className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                    +{reward.points}
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <TrendingUp className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                    +{reward.experience} EXP
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex border-l border-gray-200 dark:border-gray-700">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            关闭
          </button>
        </div>
      </div>
    ),
    {
      duration: 4000,
      position: 'top-right',
    }
  );
};

export default showPointReward;