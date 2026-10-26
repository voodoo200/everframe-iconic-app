
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const cfg = window.ICONIC_CONFIG || {};
const gate = document.getElementById('authGate');
const status = document.getElementById('authStatus');
const form = document.getElementById('contactForm');

const setStatus = (message, error = false) => {
  status.textContent = message;
  status.classList.toggle('error', error);
};

if (
  !cfg.supabaseUrl?.startsWith('https://') ||
  !cfg.supabaseAnonKey ||
  cfg.supabaseAnonKey.startsWith('PASTE_')
) {
  setStatus('Система не подключена к базе. Проверьте config.js.', true);
  document.getElementById('authSubmit').disabled = true;
} else {
  const db = createClient(cfg.supabaseUrl, cfg.supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false
    }
  });

  let user = null;
  let workspaceId = null;
  let busy = false;

  const cols = [
    'name', 'company', 'profession', 'city',
    'country', 'contact', 'link', 'type',
    'priority', 'status', 'next', 'amount',
    'reason', 'notes'
  ];

  const fromDb = row => ({
    ...Object.fromEntries(
      cols.map(key => [key, row[key] ?? ''])
    ),
    id: row.id,
    created: row.created_at
  });

  const toDb = contact => ({
    ...Object.fromEntries(
      cols.map(key => [key, contact[key] || null])
    ),
    amount: contact.amount ? Number(contact.amount) : null,
    next: contact.next || null,
    workspace_id: workspaceId
  });

  async function refresh() {
    if (!workspaceId) return;

    const { data, error } = await db
      .from('contacts')
      .select('*')
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false })
      .limit(1000);

    if (error) throw error;

    contacts = (data || []).map(fromDb);
    render();
  }

  async function initialize() {
    try {
      const { data, error } = await db.auth.getUser();

      if (error || !data?.user) {
        user = null;
        workspaceId = null;
        gate.classList.remove('hide');
        setStatus('Войдите под своей учётной записью.');
        return;
      }

      user = data.user;

      const { data: membership, error: membershipError } = await db
        .from('workspace_members')
        .select('workspace_id')
        .eq('user_id', user.id)
        .limit(1)
        .maybeSingle();

      if (membershipError) throw membershipError;

      if (!membership) {
        workspaceId = null;
        gate.classList.remove('hide');
        setStatus('Доступ не выдан. Обратитесь к администратору.', true);
        return;
      }

      workspaceId = membership.workspace_id;

      await refresh();

      gate.classList.add('hide');

      document.getElementById('userLine').textContent =
        user.email || '';

      document.getElementById('signOut').classList.remove('hide');

    } catch (error) {
      gate.classList.remove('hide');
      setStatus(
        'Ошибка подключения: ' + (error.message || 'неизвестная ошибка'),
        true
      );
      console.error('ICONIC CRM initialization:', error);
    }
  }

  document.getElementById('authForm').addEventListener(
    'submit',
    async event => {
      event.preventDefault();

      setStatus('Проверяем доступ…');

      const email = document.getElementById('authEmail').value.trim();
      const password = document.getElementById('authPassword').value;

      const { error } = await db.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        setStatus('Не удалось войти: ' + error.message, true);
        return;
      }

      await initialize();
    }
  );

  document.getElementById('signOut').addEventListener(
    'click',
    async () => {
      await db.auth.signOut();

      user = null;
      workspaceId = null;
      contacts = [];

      render();
      gate.classList.remove('hide');
      setStatus('Вы вышли из системы.');
    }
  );

  // Отключаем старый локальный обработчик из index.html.
  form.removeEventListener('submit', submitContact);

  // Новый обработчик: сохранение только в Supabase.
  submitContact = async function(event) {
    event.preventDefault();

    if (busy) return;

    if (!workspaceId || !user) {
      toast('Нет подключения к рабочей базе');
      return;
    }

    const contact = {};

    fields.forEach(key => {
      contact[key] = document
        .getElementById('f_' + key)
        .value.trim();
    });

    if (!contact.name) {
      toast('Укажите имя кандидата');
      return;
    }

    const duplicate = contacts.some(existing =>
      existing.id !== editing &&
      (
        (contact.link && norm(existing.link) === norm(contact.link)) ||
        (contact.contact && norm(existing.contact) === norm(contact.contact))
      )
    );

    if (duplicate) {
      toast('Возможный дубль: контакт или ссылка уже есть');
      return;
    }

    busy = true;

    try {
      const payload = toDb(contact);

      let result;

      if (editing) {
        result = await db
          .from('contacts')
          .update(payload)
          .eq('id', editing)
          .eq('workspace_id', workspaceId)
          .select('id');
      } else {
        result = await db
          .from('contacts')
          .insert(payload)
          .select('id');
      }

      if (result.error) throw result.error;

      if (!result.data || result.data.length !== 1) {
        throw new Error('База не подтвердила сохранение записи');
      }

      await refresh();

      closeEditor();
      toast('Контакт сохранён в Supabase');

    } catch (error) {
      console.error('ICONIC CRM save error:', error);
      toast('Ошибка сохранения: ' + error.message);
    } finally {
      busy = false;
    }
  };

  // Подключаем новый обработчик один раз, при загрузке.
  form.addEventListener('submit', submitContact);

  // Удаление из облачной базы.
  removeContact = async function() {
    if (busy || !editing) return;

    if (!confirm('Удалить контакт без возможности отмены?')) {
      return;
    }

    if (!workspaceId) {
      toast('Нет подключения к базе');
      return;
    }

    busy = true;

    try {
      const { data, error } = await db
        .from('contacts')
        .delete()
        .eq('id', editing)
        .eq('workspace_id', workspaceId)
        .select('id');

      if (error) throw error;

      if (!data || data.length !== 1) {
        throw new Error('База не подтвердила удаление');
      }

      await refresh();

      closeEditor();
      toast('Контакт удалён');

    } catch (error) {
      console.error('ICONIC CRM delete error:', error);
      toast('Ошибка удаления: ' + error.message);
    } finally {
      busy = false;
    }
  };

  // Отключаем локальный импорт, пока нет безопасного облачного импорта.
  const importInput = document.getElementById('importFile');

  importInput.disabled = true;
  importInput.title = 'Облачный импорт пока недоступен';

  // Не допускаем ложного локального импорта через кнопку.
  const importButton = document.querySelector(
    '[onclick*="importFile"]'
  );

  if (importButton) {
    importButton.disabled = true;
    importButton.title = 'Облачный импорт пока недоступен';
  }

  db.auth.onAuthStateChange(event => {
    if (event === 'SIGNED_OUT') {
      user = null;
      workspaceId = null;
      contacts = [];
      render();
      gate.classList.remove('hide');
    }
  });

  await initialize();
}
