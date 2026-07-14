import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught error in Portfolio App:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#070814] text-[#f8fafc] flex flex-col justify-center items-center px-6 text-center font-sans">
          <div className="w-16 h-16 rounded-3xl bg-red-500/10 flex items-center justify-center border border-red-500/20 text-red-400 text-3xl mb-8">
            <i className="fa-solid fa-triangle-exclamation"></i>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter mb-4 leading-none bg-gradient-to-b from-white via-white to-gray-400 bg-clip-text text-transparent">
            Portfolio Temporarily Unavailable
          </h1>
          <p className="text-gray-450 text-sm md:text-base mb-10 max-w-md font-light leading-relaxed opacity-70">
            We encountered an unexpected error while rendering this portfolio. Please refresh the page or try again later.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-8 py-3 bg-white text-black font-bold text-xs uppercase tracking-wider rounded-full shadow-lg shadow-white/20 transition-all active:scale-95 hover:bg-gray-200"
          >
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;
