import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { data: logs, error } = await supabase
      .from('generation_logs')
      .select(`
        id,
        article_id,
        source_url,
        generation_time_seconds,
        word_count,
        status,
        created_at,
        articles (
          title
        )
      `)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw new Error(error.message);

    const now = new Date();
    const dayOfWeek = now.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(now);
    monday.setDate(now.getDate() + mondayOffset);
    monday.setHours(0, 0, 0, 0);

    const { count: weekCount } = await supabase
      .from('generation_logs')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'sucesso')
      .gte('created_at', monday.toISOString());

    const entries = (logs ?? []).map((log: Record<string, unknown>) => ({
      id: log.id,
      article_id: log.article_id ?? null,
      source_url: log.source_url,
      title: (log.articles as Record<string, unknown> | null)?.title ?? null,
      word_count: log.word_count,
      generation_time_seconds: log.generation_time_seconds,
      status: log.status,
      created_at: log.created_at,
    }));

    return NextResponse.json({ entries, weekCount: weekCount ?? 0 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro desconhecido';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
