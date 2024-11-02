import React from 'react';
import './Home.scss';

const Home: React.FC = () => {
  return (
    <div className="home-page">
      <section className="hero">
        <h1>Welcome to DevSpark</h1>
        <p>Track, share, and collaborate on your development projects</p>
        <button className="button-primary">Get Started</button>
      </section>
      
      <section className="features grid grid-cols-3">
        <div className="card feature-card">
          <h3>📊 Project Tracking</h3>
          <p>Organize and track your development projects in one place</p>
        </div>
        <div className="card feature-card">
          <h3>🔗 Code Sharing</h3>
          <p>Share code snippets and collaborate with your team</p>
        </div>
        <div className="card feature-card">
          <h3>📈 Progress Insights</h3>
          <p>Get insights into your development progress</p>
        </div>
      </section>
      
      <section className="recent-activity">
        <h2>Recent Activity</h2>
        <div className="activity-list">
          {/* We'll add activity items here later */}
        </div>
      </section>
    </div>
  );
};

export default Home; 