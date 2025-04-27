document.addEventListener('DOMContentLoaded', async () => {
    let mainContainer = null;
    let detailContainer = null;
    let deletePopup = null;
    let editPopup = null;
    let selectedAffirmationId = null;
    let selectedAffirmationElement = null;
    let savedScrollY = 0;

    // Здесь подгрузка проектов владельца
    try {
        const projectPath = '/api/v2/users/projects'
        const authPath = `${projectPath}/owner`

        console.log('authPath', authPath);

        async function getOwnerProjects() {
            try {
                const response = await fetch(authPath, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'acept': 'application/json',
                    }
                });



                if (response.status === 200) {
                    const projects = await response.json();
                    console.log('length', projects.length);
                    if (projects.length > 0) {
                        const profileSection = document.getElementById('profileSection');
                        projects.forEach(project => {
                            const projectElement = createProjectSection(project)
                            profileSection.appendChild(projectElement)
                        });
                    }
                } else {
                    console.error('Error:', response.status);
                }

            }
            catch (error) {}
        }



        function createProjectSection(project) {
            const section = document.createElement('div');
            section.className = 'detail-card text-link project-interaction';
            section.dataset.uuid = project.uuid;
            const createdAtDate = formatDateHuman(project.created_at);
            section.innerHTML = `
                <div class='detail-title'>${project.prj_name}
                <p class='sub-title'>${project.prj_description}</p>
                </div>
                <div class='detail-info'>${createdAtDate}
                    <svg xmlns="http://www.w3.org/2000/svg" width="7" height="12" fill="none" viewBox="0 0 7 12" style="margin-left: 5px;">
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 5 5-5 5"/>
                    </svg>
                </div>
            `;

            return section;
        }

        function formatDateHuman(dateString) {
            const date = new Date(dateString);
            return new Intl.DateTimeFormat('ru-RU', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }).format(date);
        }

        await getOwnerProjects();

    }
    catch (error) {}

    async function getProjectById(uuid) {
        const projectPath = '/api/v2/users/projects';

        try {
            const response = await fetch(`${projectPath}/${uuid}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'acept': 'application/json',
                }
            });

            if (response.status === 200) {
                const project = await response.json();
                return project;

            } else {
                console.error('Error:', response.status);
            }
        }
        catch (error) {}
    }

    // Хдесь дополнительные скрипты

    // Делегированный обработчик кликов
    const projectContainer = {
        main: document.getElementById('container-affirm'),
        detail: document.getElementById('project-details'),
    }
    const p = projectContainer

    document.addEventListener('click', async (e) => {
        const section = e.target.closest('.project-interaction');
        if (section) {
            // Сохраняем текущий скролл
            savedScrollY = window.pageYOffset || document.documentElement.scrollTop;

            selectedProjectElement = section;
            selectedProjectId = section.dataset.uuid;

            // Показываем детали
            p.main.classList.add('hidden-container');
            p.main.addEventListener('transitionend', async () => {
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
                p.main.style.display = 'none';
                p.detail.style.display = 'block';
                p.detail.classList.add('visible');

                let projectDetails = {
                    name: document.getElementById('projectName'),
                    description: document.getElementById('projectDescription'),
                    createdAt: document.getElementById('projectCreatedAt'),
                    id: document.getElementById('projectId'),
                };

                const project = await getProjectById(selectedProjectId)

                projectDetails.name.textContent = 'Загрузка...';
                projectDetails.description.textContent = 'Загрузка...';
                projectDetails.createdAt.textContent = 'Загрузка...';
                projectDetails.id.textContent = '2025-01-01T00:00:00Z';

                if (project) {
                    setTimeout(() => {
                        projectDetails.name.textContent = project.prj_name;
                        projectDetails.description.textContent = project.prj_description;
                        projectDetails.createdAt.textContent = formatDateHuman(project.created_at)
                        projectDetails.id.textContent = project.uuid
                    }, 50);
                } else {
                    document.getElementById('projectName').textContent = 'Возникла ошибка';

                }


            }, { once: true });
            return;
        }

        // Кнопка "Назад"
        if (e.target.closest('#closeAffirmation')) {
            closeAffirmation();
            return;
        }

        function closeAffirmation() {
            p.detail.classList.remove('visible');
            p.detail.addEventListener('transitionend', () => {
                p.detail.style.display = 'none';
                p.main.style.display = 'block';
                p.main.classList.remove('hidden-container');
                window.scrollTo({
                    top: savedScrollY,
                    behavior: 'smooth'
                });
            }, { once: true });
        }

    });
});
