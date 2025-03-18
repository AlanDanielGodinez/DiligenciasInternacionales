import React from 'react';


const Dashboard = () => {
  return (
    <div className="dashboard">
      <main className="main-content">
        <section className="hero-section">
          <h1>Welcome to Acme Co</h1>
          <h2>You have 3 new tasks, 2 new messages and 5 new comments</h2>
          <div className="search-bar">
            <input type="text" placeholder="Search for a project or team member" />
            <button>Submit</button>
          </div>
        </section>
        <section className="projects-section">
          <h2>Your projects</h2>
          <div className="projects-grid">
            <div className="project-card">
              <div className="project-image" style={{backgroundImage: 'url("https://cdn.usegalileo.ai/sdxl10/ddf6dd80-8002-476e-87f4-a7c92afa6bd4.png")'}}></div>
              <p>Project A</p>
              <p>Description of Project A</p>
            </div>
            <div className="project-card">
              <div className="project-image" style={{backgroundImage: 'url("https://cdn.usegalileo.ai/sdxl10/d247291a-891f-417f-9c0a-42662ad8106b.png")'}}></div>
              <p>Project B</p>
              <p>Description of Project B</p>
            </div>
            <div className="project-card">
              <div className="project-image" style={{backgroundImage: 'url("https://cdn.usegalileo.ai/sdxl10/433e3da8-ce08-4cf7-8317-054cd8dbe839.png")'}}></div>
              <p>Project C</p>
              <p>Description of Project C</p>
            </div>
            <div className="project-card">
              <div className="project-image" style={{backgroundImage: 'url("https://cdn.usegalileo.ai/sdxl10/d993904b-89e9-4ce0-90e1-706c1173ee48.png")'}}></div>
              <p>Project D</p>
              <p>Description of Project D</p>
            </div>
          </div>
        </section>
        <section className="team-section">
          <h2>Your team</h2>
          <div className="team-grid">
            <div className="team-member">
              <div className="member-avatar" style={{backgroundImage: 'url("https://cdn.usegalileo.ai/sdxl10/0394ea29-3d1d-4989-992c-2ba2e9069bda.png")'}}></div>
            </div>
            <div className="team-member">
              <div className="member-avatar" style={{backgroundImage: 'url("https://cdn.usegalileo.ai/sdxl10/3a48aa23-af7e-475a-84c9-31220c03d86b.png")'}}></div>
            </div>
            <div className="team-member">
              <div className="member-avatar" style={{backgroundImage: 'url("https://cdn.usegalileo.ai/sdxl10/083e0f53-195a-4d1e-bc49-3b9daa5be411.png")'}}></div>
            </div>
            <div className="team-member">
              <div className="member-avatar" style={{backgroundImage: 'url("https://cdn.usegalileo.ai/sdxl10/1b088bd1-cf6f-46ff-95dd-e51fb22706f5.png")'}}></div>
            </div>
            <div className="team-member">
              <div className="member-avatar" style={{backgroundImage: 'url("https://cdn.usegalileo.ai/sdxl10/bc4a93d8-373c-4089-88de-401ec335d5d3.png")'}}></div>
            </div>
            <div className="team-member">
              <div className="member-avatar" style={{backgroundImage: 'url("https://cdn.usegalileo.ai/sdxl10/75a46306-4693-4c88-98c9-229193ddd0b3.png")'}}></div>
            </div>
            <div className="team-member">
              <div className="member-avatar" style={{backgroundImage: 'url("https://cdn.usegalileo.ai/sdxl10/9df2eab8-f8ae-4de9-9165-c58d9bfac259.png")'}}></div>
            </div>
          </div>
        </section>
        <section className="activity-section">
          <h2>Latest activity</h2>
          <div className="activity-list">
            <div className="activity-item">
              <div className="activity-avatar" style={{backgroundImage: 'url("https://cdn.usegalileo.ai/sdxl10/4b31f68e-862e-461d-90a5-6a48493d3513.png")'}}></div>
              <div className="activity-info">
                <p>Refactor the React components</p>
                <p>Task created · June 10</p>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-avatar" style={{backgroundImage: 'url("https://cdn.usegalileo.ai/sdxl10/7b79c9c5-1810-4ce3-9500-7ced82ad3ae2.png")'}}></div>
              <div className="activity-info">
                <p>Any update on this issue?</p>
                <p>Commented on issue #23 · June 9</p>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-avatar" style={{backgroundImage: 'url("https://cdn.usegalileo.ai/sdxl10/ade8efeb-3fed-4a0a-aabe-7491cfb11415.png")'}}></div>
              <div className="activity-info">
                <p>Update the design spec</p>
                <p>Task completed · June 8</p>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-avatar" style={{backgroundImage: 'url("https://cdn.usegalileo.ai/sdxl10/bbd0d90d-6bc8-444c-b5f6-66353f6ddbd4.png")'}}></div>
              <div className="activity-info">
                <p>Add missing error message</p>
                <p>Task created · June 7</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;