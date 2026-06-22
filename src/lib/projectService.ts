import { supabase } from './supabase'
import type { FurnitureItemData, FurnitureType, RoomDimensions } from '../types/home'

export interface ProjectSummary {
  id: string
  name: string
  created_at: string
  updated_at: string
}

export interface SaveProjectParams {
  projectId: string | null
  projectName: string
  roomDimensions: RoomDimensions
  wallColor: string
  floorColor: string
  furnitureItems: FurnitureItemData[]
}

export async function saveProject(params: SaveProjectParams): Promise<string> {
  const { projectId, projectName, roomDimensions, wallColor, floorColor, furnitureItems } = params

  // Upsert project row
  let savedProjectId: string
  if (projectId) {
    const { error } = await supabase
      .from('projects')
      .update({ name: projectName, updated_at: new Date().toISOString() })
      .eq('id', projectId)
    if (error) throw error
    savedProjectId = projectId
  } else {
    const { data, error } = await supabase
      .from('projects')
      .insert({ name: projectName })
      .select('id')
      .single()
    if (error) throw error
    savedProjectId = data.id as string
  }

  // Replace the single room (cascade deletes old furniture_items too)
  await supabase.from('rooms').delete().eq('project_id', savedProjectId)

  const { data: room, error: roomError } = await supabase
    .from('rooms')
    .insert({
      project_id: savedProjectId,
      width: roomDimensions.width,
      length: roomDimensions.length,
      height: roomDimensions.height,
      wall_color: wallColor,
      floor_color: floorColor,
    })
    .select('id')
    .single()
  if (roomError) throw roomError

  if (furnitureItems.length > 0) {
    const { error: furniError } = await supabase.from('furniture_items').insert(
      furnitureItems.map((item) => ({
        id: item.id,
        project_id: savedProjectId,
        room_id: room.id as string,
        type: item.type,
        position_x: item.position[0],
        position_y: item.position[1],
        position_z: item.position[2],
        rotation_x: item.rotation[0],
        rotation_y: item.rotation[1],
        rotation_z: item.rotation[2],
        size_x: item.size[0],
        size_y: item.size[1],
        size_z: item.size[2],
        color: item.color,
      })),
    )
    if (furniError) throw furniError
  }

  return savedProjectId
}

export async function listProjects(): Promise<ProjectSummary[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('id, name, created_at, updated_at')
    .order('updated_at', { ascending: false })
  if (error) throw error
  return data as ProjectSummary[]
}

export interface LoadedProject {
  projectName: string
  roomDimensions: RoomDimensions
  wallColor: string
  floorColor: string
  furnitureItems: FurnitureItemData[]
}

export async function loadProject(projectId: string): Promise<LoadedProject> {
  const [{ data: projectData, error: projectError }, { data: roomData, error: roomError }, { data: furniData, error: furniError }] =
    await Promise.all([
      supabase.from('projects').select('name').eq('id', projectId).single(),
      supabase.from('rooms').select('*').eq('project_id', projectId).limit(1).single(),
      supabase.from('furniture_items').select('*').eq('project_id', projectId),
    ])

  if (projectError) throw projectError
  if (roomError) throw roomError
  if (furniError) throw furniError

  return {
    projectName: projectData.name as string,
    roomDimensions: {
      width: Number(roomData.width),
      length: Number(roomData.length),
      height: Number(roomData.height),
    },
    wallColor: roomData.wall_color as string,
    floorColor: roomData.floor_color as string,
    furnitureItems: (furniData ?? []).map((row) => ({
      id: row.id as string,
      type: row.type as FurnitureType,
      position: [Number(row.position_x), Number(row.position_y), Number(row.position_z)] as [number, number, number],
      rotation: [Number(row.rotation_x), Number(row.rotation_y), Number(row.rotation_z)] as [number, number, number],
      size: [Number(row.size_x), Number(row.size_y), Number(row.size_z)] as [number, number, number],
      color: row.color as string,
    })),
  }
}

export async function deleteProject(projectId: string): Promise<void> {
  const { error } = await supabase.from('projects').delete().eq('id', projectId)
  if (error) throw error
}
